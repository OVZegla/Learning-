import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CourseStatus, Role } from "../common/types";
import { AccessService } from "./access.service";
import {
  CreateCourseDto,
  CreateLessonDto,
  CreateModuleDto,
  QuizAttemptDto,
  UpdateCourseDto,
  UpdateLessonDto,
  UpdateModuleDto,
  UpsertQuizDto,
} from "./dto/course.dto";

type AuthActor = { id: string; role: Role };

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessService,
  ) {}

  async listForUser(user: AuthActor) {
    if (user.role === Role.ADMIN) {
      return this.prisma.course.findMany({
        orderBy: { updatedAt: "desc" },
        include: { author: { select: { id: true, name: true } } },
      });
    }
    if (user.role === Role.FORMATEUR) {
      return this.prisma.course.findMany({
        where: { authorId: user.id },
        orderBy: { updatedAt: "desc" },
        include: { author: { select: { id: true, name: true } } },
      });
    }
    const ids = await this.access.accessibleCourseIds(user.id);
    const courses = await this.prisma.course.findMany({
      where: { id: { in: ids }, status: CourseStatus.PUBLISHED },
      orderBy: { updatedAt: "desc" },
      include: {
        author: { select: { id: true, name: true } },
        modules: { select: { lessons: { select: { id: true } } } },
      },
    });
    const progress = await this.prisma.progress.findMany({
      where: { userId: user.id, lesson: { module: { courseId: { in: ids } } } },
      select: { lessonId: true, completedAt: true },
    });
    const completed = new Set(progress.filter((p) => p.completedAt).map((p) => p.lessonId));
    return courses.map(({ modules, ...c }) => {
      const lessonIds = modules.flatMap((m) => m.lessons.map((l) => l.id));
      const done = lessonIds.filter((id) => completed.has(id)).length;
      return { ...c, lessonsTotal: lessonIds.length, lessonsCompleted: done };
    });
  }

  async getDetail(user: AuthActor, courseId: string) {
    const canEdit = await this.canEdit(user, courseId);
    if (!canEdit) {
      const allowed = await this.access.canAccessCourse(user, courseId);
      if (!allowed) throw new ForbiddenException("Access to this course is not granted");
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        author: { select: { id: true, name: true } },
        modules: {
          orderBy: { position: "asc" },
          include: {
            lessons: {
              orderBy: { position: "asc" },
              include: {
                quiz: {
                  include: {
                    questions: { orderBy: { position: "asc" } },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!course) throw new NotFoundException();

    const [progress, certificate] = canEdit
      ? [[] as Awaited<ReturnType<PrismaService["progress"]["findMany"]>>, null]
      : await Promise.all([
          this.prisma.progress.findMany({
            where: {
              userId: user.id,
              lesson: { module: { courseId } },
            },
          }),
          this.prisma.certificate.findUnique({
            where: { userId_courseId: { userId: user.id, courseId } },
          }),
        ]);

    const completedLessonIds = new Set(
      progress.filter((p) => p.completedAt).map((p) => p.lessonId),
    );

    const requireSeq = course.requireSequentialProgress && !canEdit;
    let prevCompleted = true;

    const modules = course.modules.map((m) => ({
      ...m,
      lessons: m.lessons.map((l) => {
        const completed = completedLessonIds.has(l.id);
        const locked = requireSeq && !prevCompleted;
        const unlocked = !locked;
        prevCompleted = completed;
        return {
          ...l,
          content: this.parseJson(l.content),
          completed,
          locked,
          unlocked,
          quiz: l.quiz
            ? {
                id: l.quiz.id,
                passingScore: l.quiz.passingScore,
                isFinal: l.quiz.isFinal,
                questions: l.quiz.questions.map((q) => ({
                  id: q.id,
                  prompt: q.prompt,
                  type: q.type,
                  position: q.position,
                  choices: this.parseChoices(q.choices).map((c) =>
                    canEdit ? c : { id: c.id, text: c.text },
                  ),
                })),
              }
            : null,
        };
      }),
    }));

    return {
      ...course,
      canEdit,
      certificate,
      modules,
    };
  }

  async create(author: AuthActor, dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: { ...dto, authorId: author.id },
    });
  }

  async update(user: AuthActor, id: string, dto: UpdateCourseDto) {
    await this.assertCanEdit(user, id);
    return this.prisma.course.update({ where: { id }, data: dto });
  }

  async remove(user: AuthActor, id: string) {
    await this.assertCanEdit(user, id);
    await this.prisma.course.delete({ where: { id } });
    return { ok: true };
  }

  async addModule(user: AuthActor, courseId: string, dto: CreateModuleDto) {
    await this.assertCanEdit(user, courseId);
    return this.prisma.module.create({ data: { ...dto, courseId } });
  }

  async updateModule(user: AuthActor, moduleId: string, dto: UpdateModuleDto) {
    const mod = await this.prisma.module.findUnique({ where: { id: moduleId } });
    if (!mod) throw new NotFoundException();
    await this.assertCanEdit(user, mod.courseId);
    return this.prisma.module.update({ where: { id: moduleId }, data: dto });
  }

  async removeModule(user: AuthActor, moduleId: string) {
    const mod = await this.prisma.module.findUnique({ where: { id: moduleId } });
    if (!mod) throw new NotFoundException();
    await this.assertCanEdit(user, mod.courseId);
    await this.prisma.module.delete({ where: { id: moduleId } });
    return { ok: true };
  }

  async addLesson(user: AuthActor, moduleId: string, dto: CreateLessonDto) {
    const mod = await this.prisma.module.findUnique({ where: { id: moduleId } });
    if (!mod) throw new NotFoundException();
    await this.assertCanEdit(user, mod.courseId);
    return this.prisma.lesson.create({
      data: {
        moduleId,
        title: dto.title,
        position: dto.position,
        type: dto.type,
        content: JSON.stringify(dto.content ?? {}),
      },
    });
  }

  async updateLesson(user: AuthActor, lessonId: string, dto: UpdateLessonDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true },
    });
    if (!lesson) throw new NotFoundException();
    await this.assertCanEdit(user, lesson.module.courseId);

    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.position !== undefined) data.position = dto.position;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.content !== undefined) data.content = JSON.stringify(dto.content);

    return this.prisma.lesson.update({ where: { id: lessonId }, data });
  }

  async removeLesson(user: AuthActor, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true },
    });
    if (!lesson) throw new NotFoundException();
    await this.assertCanEdit(user, lesson.module.courseId);
    await this.prisma.lesson.delete({ where: { id: lessonId } });
    return { ok: true };
  }

  async reorderModules(user: AuthActor, courseId: string, ids: string[]) {
    await this.assertCanEdit(user, courseId);
    await this.prisma.$transaction(
      ids.map((id, idx) =>
        this.prisma.module.update({ where: { id }, data: { position: idx + 1 } }),
      ),
    );
    return { ok: true };
  }

  async reorderLessons(user: AuthActor, moduleId: string, ids: string[]) {
    const mod = await this.prisma.module.findUnique({ where: { id: moduleId } });
    if (!mod) throw new NotFoundException();
    await this.assertCanEdit(user, mod.courseId);
    await this.prisma.$transaction(
      ids.map((id, idx) =>
        this.prisma.lesson.update({ where: { id }, data: { position: idx + 1 } }),
      ),
    );
    return { ok: true };
  }

  async upsertQuiz(user: AuthActor, lessonId: string, dto: UpsertQuizDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true, quiz: true },
    });
    if (!lesson) throw new NotFoundException();
    await this.assertCanEdit(user, lesson.module.courseId);
    if (lesson.type !== "QUIZ") {
      throw new ForbiddenException("This lesson is not a quiz");
    }

    return this.prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.upsert({
        where: { lessonId },
        create: {
          lessonId,
          passingScore: dto.passingScore,
          isFinal: dto.isFinal ?? false,
        },
        update: {
          passingScore: dto.passingScore,
          isFinal: dto.isFinal ?? false,
        },
      });
      await tx.question.deleteMany({ where: { quizId: quiz.id } });
      if (dto.questions.length) {
        await tx.question.createMany({
          data: dto.questions.map((q) => ({
            quizId: quiz.id,
            prompt: q.prompt,
            type: q.type,
            position: q.position,
            choices: JSON.stringify(q.choices),
          })),
        });
      }
      return tx.quiz.findUnique({
        where: { id: quiz.id },
        include: { questions: { orderBy: { position: "asc" } } },
      });
    });
  }

  async markLessonComplete(user: AuthActor, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } },
    });
    if (!lesson) throw new NotFoundException();
    const allowed = await this.access.canAccessCourse(user, lesson.module.courseId);
    if (!allowed) throw new ForbiddenException("Course not accessible");

    if (lesson.type === "QUIZ") {
      throw new ForbiddenException("Use the quiz attempt endpoint for quizzes");
    }

    await this.ensureUnlocked(user, lesson);

    await this.prisma.progress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId } },
      create: { userId: user.id, lessonId, completedAt: new Date() },
      update: { completedAt: new Date() },
    });
    return { ok: true };
  }

  async submitQuizAttempt(user: AuthActor, lessonId: string, dto: QuizAttemptDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: { include: { course: true } },
        quiz: { include: { questions: true } },
      },
    });
    if (!lesson || !lesson.quiz) throw new NotFoundException();
    const allowed = await this.access.canAccessCourse(user, lesson.module.courseId);
    if (!allowed) throw new ForbiddenException("Course not accessible");
    await this.ensureUnlocked(user, lesson);

    const total = lesson.quiz.questions.length;
    let correct = 0;
    const detail: { questionId: string; correct: boolean }[] = [];

    for (const question of lesson.quiz.questions) {
      const choices = this.parseChoices(question.choices);
      const correctIds = new Set(choices.filter((c) => c.correct).map((c) => c.id));
      const given = new Set(
        dto.answers.find((a) => a.questionId === question.id)?.choiceIds ?? [],
      );
      const isCorrect =
        given.size === correctIds.size &&
        [...correctIds].every((id) => given.has(id));
      if (isCorrect) correct += 1;
      detail.push({ questionId: question.id, correct: isCorrect });
    }

    const score = total === 0 ? 100 : Math.round((correct / total) * 100);
    const passed = score >= lesson.quiz.passingScore;

    await this.prisma.quizAttempt.create({
      data: {
        quizId: lesson.quiz.id,
        userId: user.id,
        score,
        passed,
        answers: JSON.stringify(dto.answers),
      },
    });

    let certificate: { id: string; issuedAt: Date } | null = null;

    if (passed) {
      await this.prisma.progress.upsert({
        where: { userId_lessonId: { userId: user.id, lessonId } },
        create: { userId: user.id, lessonId, completedAt: new Date() },
        update: { completedAt: new Date() },
      });

      if (lesson.quiz.isFinal) {
        const cert = await this.prisma.certificate.upsert({
          where: {
            userId_courseId: { userId: user.id, courseId: lesson.module.courseId },
          },
          create: { userId: user.id, courseId: lesson.module.courseId },
          update: {},
        });
        certificate = { id: cert.id, issuedAt: cert.issuedAt };
      }
    }

    return {
      score,
      passed,
      passingScore: lesson.quiz.passingScore,
      isFinal: lesson.quiz.isFinal,
      correctCount: correct,
      totalQuestions: total,
      detail,
      certificate,
    };
  }

  async listCertificates(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: "desc" },
      include: {
        course: { select: { id: true, title: true, category: true } },
      },
    });
  }

  private async ensureUnlocked(
    user: AuthActor,
    lesson: { id: string; position: number; moduleId: string; module: { courseId: string; position: number; course: { requireSequentialProgress: boolean } } },
  ) {
    if (!lesson.module.course.requireSequentialProgress) return;
    if (user.role === Role.ADMIN) return;

    const earlier = await this.prisma.lesson.findMany({
      where: {
        OR: [
          { module: { courseId: lesson.module.courseId, position: { lt: lesson.module.position } } },
          { moduleId: lesson.moduleId, position: { lt: lesson.position } },
        ],
      },
      select: { id: true },
    });
    if (!earlier.length) return;
    const completed = await this.prisma.progress.count({
      where: {
        userId: user.id,
        lessonId: { in: earlier.map((l) => l.id) },
        completedAt: { not: null },
      },
    });
    if (completed < earlier.length) {
      throw new ForbiddenException("Complete earlier lessons first");
    }
  }

  private async canEdit(user: AuthActor, courseId: string): Promise<boolean> {
    if (user.role === Role.ADMIN) return true;
    if (user.role !== Role.FORMATEUR) return false;
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { authorId: true },
    });
    return !!course && course.authorId === user.id;
  }

  private async assertCanEdit(user: AuthActor, courseId: string) {
    const ok = await this.canEdit(user, courseId);
    if (!ok) throw new ForbiddenException("You cannot edit this course");
  }

  private parseJson(s: string): unknown {
    try {
      return JSON.parse(s);
    } catch {
      return {};
    }
  }

  private parseChoices(s: string): { id: string; text: string; correct: boolean }[] {
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      /* noop */
    }
    return [];
  }
}

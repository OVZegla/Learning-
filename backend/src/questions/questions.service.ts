import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "../common/types";
import { AccessService } from "../courses/access.service";
import { AnswerQuestionDto, CreateQuestionDto } from "./dto/question.dto";

type AuthActor = { id: string; role: Role };

@Injectable()
export class QuestionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessService,
  ) {}

  private async assertCanRead(user: AuthActor, courseId: string) {
    if (user.role === Role.ADMIN) return;
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { authorId: true },
    });
    if (!course) throw new NotFoundException("Formation introuvable");
    if (user.role === Role.FORMATEUR && course.authorId === user.id) return;
    const ok = await this.access.canAccessCourse(user, courseId);
    if (!ok) throw new ForbiddenException("Accès refusé à cette formation");
  }

  private async canAnswer(user: AuthActor, courseId: string) {
    if (user.role === Role.ADMIN) return true;
    if (user.role !== Role.FORMATEUR) return false;
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { authorId: true },
    });
    return course?.authorId === user.id;
  }

  async listForCourse(user: AuthActor, courseId: string) {
    await this.assertCanRead(user, courseId);
    const items = await this.prisma.courseQuestion.findMany({
      where: { courseId },
      orderBy: [{ resolvedAt: "asc" }, { createdAt: "desc" }],
      include: {
        asker: { select: { id: true, name: true } },
        answerBy: { select: { id: true, name: true } },
      },
    });
    const canAnswer = await this.canAnswer(user, courseId);
    return { items, canAnswer };
  }

  async listAccessibleCourses(user: AuthActor) {
    // Returns all courses the user can see, with open/resolved counts.
    let courseIds: string[] = [];
    if (user.role === Role.ADMIN) {
      const courses = await this.prisma.course.findMany({ select: { id: true } });
      courseIds = courses.map((c) => c.id);
    } else if (user.role === Role.FORMATEUR) {
      const courses = await this.prisma.course.findMany({
        where: { authorId: user.id },
        select: { id: true },
      });
      courseIds = courses.map((c) => c.id);
    } else {
      courseIds = await this.access.accessibleCourseIds(user.id);
    }
    if (courseIds.length === 0) return [];
    const courses = await this.prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, title: true, category: true, authorId: true },
    });
    const counts = await this.prisma.courseQuestion.groupBy({
      by: ["courseId", "resolvedAt"],
      where: { courseId: { in: courseIds } },
      _count: { _all: true },
    });
    const byCourse = new Map<string, { open: number; resolved: number }>();
    for (const c of counts) {
      const entry = byCourse.get(c.courseId) ?? { open: 0, resolved: 0 };
      if (c.resolvedAt) entry.resolved += c._count._all;
      else entry.open += c._count._all;
      byCourse.set(c.courseId, entry);
    }
    return courses.map((c) => ({
      ...c,
      canAnswer:
        user.role === Role.ADMIN ||
        (user.role === Role.FORMATEUR && c.authorId === user.id),
      openCount: byCourse.get(c.id)?.open ?? 0,
      resolvedCount: byCourse.get(c.id)?.resolved ?? 0,
    }));
  }

  async ask(user: AuthActor, courseId: string, dto: CreateQuestionDto) {
    await this.assertCanRead(user, courseId);
    return this.prisma.courseQuestion.create({
      data: { courseId, askerId: user.id, body: dto.body },
      include: {
        asker: { select: { id: true, name: true } },
        answerBy: { select: { id: true, name: true } },
      },
    });
  }

  async answer(user: AuthActor, questionId: string, dto: AnswerQuestionDto) {
    const q = await this.prisma.courseQuestion.findUnique({
      where: { id: questionId },
      select: { courseId: true },
    });
    if (!q) throw new NotFoundException();
    if (!(await this.canAnswer(user, q.courseId))) {
      throw new ForbiddenException("Seul le formateur peut répondre");
    }
    return this.prisma.courseQuestion.update({
      where: { id: questionId },
      data: {
        answerBody: dto.body,
        answerById: user.id,
        answeredAt: new Date(),
        resolvedAt: new Date(),
      },
      include: {
        asker: { select: { id: true, name: true } },
        answerBy: { select: { id: true, name: true } },
      },
    });
  }

  async toggleResolved(user: AuthActor, questionId: string) {
    const q = await this.prisma.courseQuestion.findUnique({
      where: { id: questionId },
      select: { courseId: true, resolvedAt: true },
    });
    if (!q) throw new NotFoundException();
    if (!(await this.canAnswer(user, q.courseId))) {
      throw new ForbiddenException();
    }
    return this.prisma.courseQuestion.update({
      where: { id: questionId },
      data: { resolvedAt: q.resolvedAt ? null : new Date() },
      include: {
        asker: { select: { id: true, name: true } },
        answerBy: { select: { id: true, name: true } },
      },
    });
  }

  async remove(user: AuthActor, questionId: string) {
    const q = await this.prisma.courseQuestion.findUnique({
      where: { id: questionId },
      select: { askerId: true, courseId: true },
    });
    if (!q) throw new NotFoundException();
    const isAuthor = await this.canAnswer(user, q.courseId);
    if (!isAuthor && q.askerId !== user.id) {
      throw new ForbiddenException();
    }
    await this.prisma.courseQuestion.delete({ where: { id: questionId } });
    return { ok: true };
  }
}

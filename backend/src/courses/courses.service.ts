import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CourseStatus, Role } from "@prisma/client";
import { AccessService } from "./access.service";
import {
  CreateCourseDto,
  CreateLessonDto,
  CreateModuleDto,
  UpdateCourseDto,
} from "./dto/course.dto";

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessService,
  ) {}

  async listForUser(user: { id: string; role: Role }) {
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
    return this.prisma.course.findMany({
      where: { id: { in: ids }, status: CourseStatus.PUBLISHED },
      orderBy: { updatedAt: "desc" },
      include: { author: { select: { id: true, name: true } } },
    });
  }

  async getDetail(user: { id: string; role: Role }, courseId: string) {
    const allowed = await this.access.canAccessCourse(user, courseId);
    if (!allowed) throw new ForbiddenException("Access to this course is not granted");

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        author: { select: { id: true, name: true } },
        modules: {
          orderBy: { position: "asc" },
          include: { lessons: { orderBy: { position: "asc" } } },
        },
      },
    });
    if (!course) throw new NotFoundException();
    return course;
  }

  async create(author: { id: string; role: Role }, dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: { ...dto, authorId: author.id },
    });
  }

  async update(user: { id: string; role: Role }, id: string, dto: UpdateCourseDto) {
    await this.assertCanEdit(user, id);
    return this.prisma.course.update({ where: { id }, data: dto });
  }

  async remove(user: { id: string; role: Role }, id: string) {
    await this.assertCanEdit(user, id);
    await this.prisma.course.delete({ where: { id } });
    return { ok: true };
  }

  async addModule(user: { id: string; role: Role }, courseId: string, dto: CreateModuleDto) {
    await this.assertCanEdit(user, courseId);
    return this.prisma.module.create({ data: { ...dto, courseId } });
  }

  async addLesson(user: { id: string; role: Role }, moduleId: string, dto: CreateLessonDto) {
    const mod = await this.prisma.module.findUnique({ where: { id: moduleId } });
    if (!mod) throw new NotFoundException();
    await this.assertCanEdit(user, mod.courseId);
    return this.prisma.lesson.create({
      data: {
        moduleId,
        title: dto.title,
        position: dto.position,
        type: dto.type,
        content: dto.content as any,
      },
    });
  }

  async reorderModules(user: { id: string; role: Role }, courseId: string, ids: string[]) {
    await this.assertCanEdit(user, courseId);
    await this.prisma.$transaction(
      ids.map((id, idx) =>
        this.prisma.module.update({ where: { id }, data: { position: idx + 1 } }),
      ),
    );
    return { ok: true };
  }

  async reorderLessons(user: { id: string; role: Role }, moduleId: string, ids: string[]) {
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

  private async assertCanEdit(user: { id: string; role: Role }, courseId: string) {
    if (user.role === Role.ADMIN) return;
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { authorId: true },
    });
    if (!course) throw new NotFoundException();
    if (user.role !== Role.FORMATEUR || course.authorId !== user.id) {
      throw new ForbiddenException("You cannot edit this course");
    }
  }
}

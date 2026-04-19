import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEnrollmentDto } from "./dto/enrollment.dto";

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  list(courseId?: string) {
    return this.prisma.enrollment.findMany({
      where: courseId ? { courseId } : undefined,
      include: {
        user: { select: { id: true, email: true, name: true } },
        group: { select: { id: true, name: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { grantedAt: "desc" },
    });
  }

  async create(dto: CreateEnrollmentDto) {
    if (!dto.userId && !dto.groupId) {
      throw new BadRequestException("Provide userId or groupId");
    }
    if (dto.userId && dto.groupId) {
      throw new BadRequestException("Provide either userId or groupId, not both");
    }
    const course = await this.prisma.course.findUnique({ where: { id: dto.courseId } });
    if (!course) throw new NotFoundException("Course not found");

    return this.prisma.enrollment.upsert({
      where: dto.userId
        ? { courseId_userId: { courseId: dto.courseId, userId: dto.userId } }
        : { courseId_groupId: { courseId: dto.courseId, groupId: dto.groupId! } },
      create: {
        courseId: dto.courseId,
        userId: dto.userId,
        groupId: dto.groupId,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
      update: {
        revokedAt: null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });
  }

  async revoke(id: string) {
    const e = await this.prisma.enrollment.findUnique({ where: { id } });
    if (!e) throw new NotFoundException();
    return this.prisma.enrollment.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }
}

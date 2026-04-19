import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "../common/types";

@Injectable()
export class AccessService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Whether `user` is currently allowed to access `courseId`.
   * Admins always pass. Authors of the course pass. Otherwise the user must
   * have a live (non-revoked, non-expired) enrollment — directly or via a
   * group they belong to.
   */
  async canAccessCourse(user: { id: string; role: Role }, courseId: string): Promise<boolean> {
    if (user.role === Role.ADMIN) return true;

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { authorId: true },
    });
    if (!course) return false;
    if (course.authorId === user.id) return true;

    const now = new Date();
    const direct = await this.prisma.enrollment.findFirst({
      where: {
        courseId,
        userId: user.id,
        revokedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      select: { id: true },
    });
    if (direct) return true;

    const viaGroup = await this.prisma.enrollment.findFirst({
      where: {
        courseId,
        revokedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        group: { members: { some: { userId: user.id } } },
      },
      select: { id: true },
    });
    return Boolean(viaGroup);
  }

  /** List course ids that `userId` can access (for dashboards). */
  async accessibleCourseIds(userId: string): Promise<string[]> {
    const now = new Date();
    const direct = await this.prisma.enrollment.findMany({
      where: {
        userId,
        revokedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      select: { courseId: true },
    });
    const viaGroup = await this.prisma.enrollment.findMany({
      where: {
        revokedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        group: { members: { some: { userId } } },
      },
      select: { courseId: true },
    });
    return Array.from(new Set([...direct, ...viaGroup].map((e) => e.courseId)));
  }
}

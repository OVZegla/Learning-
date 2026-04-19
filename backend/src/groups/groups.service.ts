import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.group.findMany({
      include: { _count: { select: { members: true, enrollments: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  create(name: string, description?: string) {
    return this.prisma.group.create({ data: { name, description } });
  }

  async addMember(groupId: string, userId: string) {
    const g = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!g) throw new NotFoundException();
    return this.prisma.groupMember.upsert({
      where: { groupId_userId: { groupId, userId } },
      create: { groupId, userId },
      update: {},
    });
  }

  removeMember(groupId: string, userId: string) {
    return this.prisma.groupMember.delete({
      where: { groupId_userId: { groupId, userId } },
    });
  }
}

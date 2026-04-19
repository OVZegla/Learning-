import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { IsOptional, IsString } from "class-validator";
import { Role } from "../common/types";
import { GroupsService } from "./groups.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

class CreateGroupDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

class AddMemberDto {
  @IsString()
  userId!: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller("groups")
export class GroupsController {
  constructor(private readonly svc: GroupsService) {}

  @Get()
  list() {
    return this.svc.list();
  }

  @Post()
  create(@Body() dto: CreateGroupDto) {
    return this.svc.create(dto.name, dto.description);
  }

  @Post(":id/members")
  add(@Param("id") id: string, @Body() dto: AddMemberDto) {
    return this.svc.addMember(id, dto.userId);
  }

  @Delete(":id/members/:userId")
  remove(@Param("id") id: string, @Param("userId") userId: string) {
    return this.svc.removeMember(id, userId);
  }
}

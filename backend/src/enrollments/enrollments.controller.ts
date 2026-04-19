import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { Role } from "../common/types";
import { EnrollmentsService } from "./enrollments.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { CreateEnrollmentDto } from "./dto/enrollment.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller("enrollments")
export class EnrollmentsController {
  constructor(private readonly svc: EnrollmentsService) {}

  @Get()
  list(@Query("courseId") courseId?: string) {
    return this.svc.list(courseId);
  }

  @Post()
  create(@Body() dto: CreateEnrollmentDto) {
    return this.svc.create(dto);
  }

  @Delete(":id")
  revoke(@Param("id") id: string) {
    return this.svc.revoke(id);
  }
}

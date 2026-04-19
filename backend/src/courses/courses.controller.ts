import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Role } from "../common/types";
import { CoursesService } from "./courses.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { AuthUser, CurrentUser } from "../auth/current-user.decorator";
import {
  CreateCourseDto,
  CreateLessonDto,
  CreateModuleDto,
  ReorderDto,
  UpdateCourseDto,
} from "./dto/course.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class CoursesController {
  constructor(private readonly courses: CoursesService) {}

  @Get("courses")
  list(@CurrentUser() user: AuthUser) {
    return this.courses.listForUser(user);
  }

  @Get("courses/:id")
  get(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.courses.getDetail(user, id);
  }

  @Roles(Role.ADMIN, Role.FORMATEUR)
  @Post("courses")
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCourseDto) {
    return this.courses.create(user, dto);
  }

  @Roles(Role.ADMIN, Role.FORMATEUR)
  @Patch("courses/:id")
  update(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.courses.update(user, id, dto);
  }

  @Roles(Role.ADMIN, Role.FORMATEUR)
  @Delete("courses/:id")
  remove(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.courses.remove(user, id);
  }

  @Roles(Role.ADMIN, Role.FORMATEUR)
  @Post("courses/:id/modules")
  addModule(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() dto: CreateModuleDto,
  ) {
    return this.courses.addModule(user, id, dto);
  }

  @Roles(Role.ADMIN, Role.FORMATEUR)
  @Post("modules/:id/lessons")
  addLesson(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() dto: CreateLessonDto,
  ) {
    return this.courses.addLesson(user, id, dto);
  }

  @Roles(Role.ADMIN, Role.FORMATEUR)
  @Patch("courses/:id/modules/reorder")
  reorderModules(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() dto: ReorderDto,
  ) {
    return this.courses.reorderModules(user, id, dto.ids);
  }

  @Roles(Role.ADMIN, Role.FORMATEUR)
  @Patch("modules/:id/lessons/reorder")
  reorderLessons(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() dto: ReorderDto,
  ) {
    return this.courses.reorderLessons(user, id, dto.ids);
  }
}

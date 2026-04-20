import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
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
  QuizAttemptDto,
  ReorderDto,
  UpdateCourseDto,
  UpdateLessonDto,
  UpdateModuleDto,
  UpsertQuizDto,
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
  @Patch("modules/:id")
  updateModule(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() dto: UpdateModuleDto,
  ) {
    return this.courses.updateModule(user, id, dto);
  }

  @Roles(Role.ADMIN, Role.FORMATEUR)
  @Delete("modules/:id")
  removeModule(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.courses.removeModule(user, id);
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
  @Patch("lessons/:id")
  updateLesson(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() dto: UpdateLessonDto,
  ) {
    return this.courses.updateLesson(user, id, dto);
  }

  @Roles(Role.ADMIN, Role.FORMATEUR)
  @Delete("lessons/:id")
  removeLesson(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.courses.removeLesson(user, id);
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

  @Roles(Role.ADMIN, Role.FORMATEUR)
  @Put("lessons/:id/quiz")
  upsertQuiz(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() dto: UpsertQuizDto,
  ) {
    return this.courses.upsertQuiz(user, id, dto);
  }

  @Post("lessons/:id/complete")
  completeLesson(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.courses.markLessonComplete(user, id);
  }

  @Post("lessons/:id/quiz/attempt")
  attemptQuiz(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() dto: QuizAttemptDto,
  ) {
    return this.courses.submitQuizAttempt(user, id, dto);
  }

  @Get("certificates")
  myCertificates(@CurrentUser() user: AuthUser) {
    return this.courses.listCertificates(user.id);
  }
}

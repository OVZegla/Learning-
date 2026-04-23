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
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { AuthUser, CurrentUser } from "../auth/current-user.decorator";
import { QuestionsService } from "./questions.service";
import { AnswerQuestionDto, CreateQuestionDto } from "./dto/question.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class QuestionsController {
  constructor(private readonly service: QuestionsService) {}

  @Get("questions/courses")
  listCourses(@CurrentUser() user: AuthUser) {
    return this.service.listAccessibleCourses(user);
  }

  @Get("courses/:id/questions")
  list(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.service.listForCourse(user, id);
  }

  @Post("courses/:id/questions")
  ask(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.service.ask(user, id, dto);
  }

  @Post("questions/:id/answer")
  answer(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() dto: AnswerQuestionDto,
  ) {
    return this.service.answer(user, id, dto);
  }

  @Patch("questions/:id/resolved")
  toggleResolved(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.service.toggleResolved(user, id);
  }

  @Delete("questions/:id")
  remove(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.service.remove(user, id);
  }
}

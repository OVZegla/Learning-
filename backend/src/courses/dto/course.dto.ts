import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { CourseStatus, LessonType } from "../../common/types";

export class CreateCourseDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  coverUrl?: string;
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  coverUrl?: string;

  @IsOptional()
  @IsIn(Object.values(CourseStatus))
  status?: CourseStatus;

  @IsOptional()
  @IsBoolean()
  requireSequentialProgress?: boolean;
}

export class CreateModuleDto {
  @IsString()
  title!: string;

  @IsInt()
  @Min(1)
  position!: number;
}

export class UpdateModuleDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  position?: number;
}

export class CreateLessonDto {
  @IsString()
  title!: string;

  @IsInt()
  @Min(1)
  position!: number;

  @IsIn(Object.values(LessonType))
  type!: LessonType;

  @IsObject()
  content!: Record<string, unknown>;
}

export class UpdateLessonDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  position?: number;

  @IsOptional()
  @IsIn(Object.values(LessonType))
  type?: LessonType;

  @IsOptional()
  @IsObject()
  content?: Record<string, unknown>;
}

export class ReorderDto {
  ids!: string[];
}

export class QuizChoiceDto {
  @IsString()
  id!: string;

  @IsString()
  text!: string;

  @IsBoolean()
  correct!: boolean;
}

export class QuizQuestionDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  prompt!: string;

  @IsIn(["SINGLE", "MULTIPLE"])
  type!: "SINGLE" | "MULTIPLE";

  @IsInt()
  @Min(1)
  position!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizChoiceDto)
  choices!: QuizChoiceDto[];
}

export class UpsertQuizDto {
  @IsInt()
  @Min(0)
  passingScore!: number;

  @IsOptional()
  @IsBoolean()
  isFinal?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  questions!: QuizQuestionDto[];
}

export class QuizAttemptAnswerDto {
  @IsString()
  questionId!: string;

  @IsArray()
  @IsString({ each: true })
  choiceIds!: string[];
}

export class QuizAttemptDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizAttemptAnswerDto)
  answers!: QuizAttemptAnswerDto[];
}

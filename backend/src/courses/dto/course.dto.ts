import { IsIn, IsInt, IsObject, IsOptional, IsString, MinLength, Min } from "class-validator";
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
}

export class CreateModuleDto {
  @IsString()
  title!: string;

  @IsInt()
  @Min(1)
  position!: number;
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

export class ReorderDto {
  ids!: string[];
}

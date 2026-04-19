import { IsDateString, IsOptional, IsString, ValidateIf } from "class-validator";

export class CreateEnrollmentDto {
  @IsString()
  courseId!: string;

  @ValidateIf((o) => !o.groupId)
  @IsString()
  userId?: string;

  @ValidateIf((o) => !o.userId)
  @IsString()
  groupId?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

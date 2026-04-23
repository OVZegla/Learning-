import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(4000)
  body!: string;
}

export class AnswerQuestionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(4000)
  body!: string;
}

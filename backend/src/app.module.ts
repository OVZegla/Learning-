import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { CoursesModule } from "./courses/courses.module";
import { EnrollmentsModule } from "./enrollments/enrollments.module";
import { GroupsModule } from "./groups/groups.module";
import { UploadsModule } from "./uploads/uploads.module";
import { QuestionsModule } from "./questions/questions.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    EnrollmentsModule,
    GroupsModule,
    UploadsModule,
    QuestionsModule,
  ],
})
export class AppModule {}

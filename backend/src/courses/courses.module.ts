import { Module } from "@nestjs/common";
import { CoursesController } from "./courses.controller";
import { CoursesService } from "./courses.service";
import { AccessService } from "./access.service";

@Module({
  controllers: [CoursesController],
  providers: [CoursesService, AccessService],
  exports: [AccessService],
})
export class CoursesModule {}

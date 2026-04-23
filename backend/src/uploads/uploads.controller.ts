import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { randomUUID } from "crypto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { Role } from "../common/types";

const MAX_BYTES = 200 * 1024 * 1024;
const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
]);

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("uploads")
export class UploadsController {
  @Roles(Role.ADMIN, Role.FORMATEUR)
  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: MAX_BYTES },
      storage: diskStorage({
        destination: "uploads",
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase().slice(0, 8);
          cb(null, `${randomUUID()}${ext || ""}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED.has(file.mimetype)) {
          cb(new BadRequestException(`Type de fichier non autorisé : ${file.mimetype}`), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("Aucun fichier reçu");
    return {
      url: `/api/files/${file.filename}`,
      mimeType: file.mimetype,
      size: file.size,
      originalName: file.originalname,
    };
  }
}

// SQLite has no native enums; these mirror the allowed values stored as strings.
export const Role = {
  ADMIN: "ADMIN",
  FORMATEUR: "FORMATEUR",
  APPRENANT: "APPRENANT",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const CourseStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;
export type CourseStatus = (typeof CourseStatus)[keyof typeof CourseStatus];

export const LessonType = {
  VIDEO: "VIDEO",
  TEXT: "TEXT",
  PDF: "PDF",
  IMAGE: "IMAGE",
  QUIZ: "QUIZ",
} as const;
export type LessonType = (typeof LessonType)[keyof typeof LessonType];

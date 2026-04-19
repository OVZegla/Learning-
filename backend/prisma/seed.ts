import { PrismaClient, Role, CourseStatus, LessonType } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@learning.local";
  const passwordHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin",
      password: passwordHash,
      role: Role.ADMIN,
    },
  });

  const formateur = await prisma.user.upsert({
    where: { email: "formateur@learning.local" },
    update: {},
    create: {
      email: "formateur@learning.local",
      name: "Formateur Demo",
      password: await bcrypt.hash("formateur123", 10),
      role: Role.FORMATEUR,
    },
  });

  const apprenant = await prisma.user.upsert({
    where: { email: "apprenant@learning.local" },
    update: {},
    create: {
      email: "apprenant@learning.local",
      name: "Apprenant Demo",
      password: await bcrypt.hash("apprenant123", 10),
      role: Role.APPRENANT,
    },
  });

  const existing = await prisma.course.findFirst({ where: { title: "Bienvenue sur Learning+" } });
  if (!existing) {
    const course = await prisma.course.create({
      data: {
        title: "Bienvenue sur Learning+",
        description: "Cours de démonstration pour découvrir la plateforme.",
        category: "Onboarding",
        status: CourseStatus.PUBLISHED,
        authorId: formateur.id,
        modules: {
          create: [
            {
              title: "Introduction",
              position: 1,
              lessons: {
                create: [
                  {
                    title: "À propos de Learning+",
                    position: 1,
                    type: LessonType.TEXT,
                    content: { body: "Bienvenue ! Cette leçon présente la plateforme." },
                  },
                  {
                    title: "Vidéo d'introduction",
                    position: 2,
                    type: LessonType.VIDEO,
                    content: { url: "https://example.com/intro.mp4" },
                  },
                ],
              },
            },
          ],
        },
      },
    });

    await prisma.enrollment.create({
      data: { courseId: course.id, userId: apprenant.id },
    });
  }

  console.log("Seed complete:", { admin: admin.email, formateur: formateur.email, apprenant: apprenant.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

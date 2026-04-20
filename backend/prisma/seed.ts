import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@learning.local" },
    update: {},
    create: {
      email: "admin@learning.local",
      name: "Admin",
      password: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
    },
  });

  const formateur = await prisma.user.upsert({
    where: { email: "formateur@learning.local" },
    update: {},
    create: {
      email: "formateur@learning.local",
      name: "Formateur Demo",
      password: await bcrypt.hash("formateur123", 10),
      role: "FORMATEUR",
    },
  });

  const apprenant = await prisma.user.upsert({
    where: { email: "apprenant@learning.local" },
    update: {},
    create: {
      email: "apprenant@learning.local",
      name: "Apprenant Demo",
      password: await bcrypt.hash("apprenant123", 10),
      role: "APPRENANT",
    },
  });

  const existing = await prisma.course.findFirst({ where: { title: "Bienvenue sur Learning+" } });
  if (!existing) {
    const course = await prisma.course.create({
      data: {
        title: "Bienvenue sur Learning+",
        description: "Cours de démonstration pour découvrir la plateforme.",
        category: "Onboarding",
        status: "PUBLISHED",
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
                    type: "TEXT",
                    content: JSON.stringify({
                      body: "Bienvenue ! Cette leçon présente la plateforme.",
                    }),
                  },
                  {
                    title: "Vidéo d'introduction",
                    position: 2,
                    type: "VIDEO",
                    content: JSON.stringify({ url: "https://example.com/intro.mp4" }),
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

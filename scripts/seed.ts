import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Create courses
  const courses = ["Administração", "Desenvolvimento de Sistemas", "Edificações", "Massoterapia"]

  for (const courseName of courses) {
    await prisma.course.upsert({
      where: { name: courseName },
      update: {},
      create: { name: courseName },
    })
  }

  console.log("Seed completed!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

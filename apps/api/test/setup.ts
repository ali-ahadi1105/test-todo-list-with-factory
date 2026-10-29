import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  // Clean up test data
  await prisma.taskLabel.deleteMany();
  await prisma.subtask.deleteMany();
  await prisma.task.deleteMany();
  await prisma.section.deleteMany();
  await prisma.project.deleteMany();
  await prisma.label.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.user.deleteMany();
});

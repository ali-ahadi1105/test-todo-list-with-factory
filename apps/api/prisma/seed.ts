import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a demo user
  const passwordHash = await argon2.hash('password123');
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      passwordHash,
      name: 'Demo User',
    },
  });

  console.log(`✅ Created user: ${user.email}`);

  // Create a demo project
  const project = await prisma.project.create({
    data: {
      name: 'Welcome Project',
      description: 'Your first project to get started with the todo app',
      color: '#3B82F6',
      ownerId: user.id,
    },
  });

  console.log(`✅ Created project: ${project.name}`);

  // Create sections
  const [backlog, todo, inProgress, done] = await Promise.all([
    prisma.section.create({
      data: {
        name: 'Backlog',
        position: 0,
        projectId: project.id,
      },
    }),
    prisma.section.create({
      data: {
        name: 'To Do',
        position: 1,
        projectId: project.id,
      },
    }),
    prisma.section.create({
      data: {
        name: 'In Progress',
        position: 2,
        projectId: project.id,
      },
    }),
    prisma.section.create({
      data: {
        name: 'Done',
        position: 3,
        projectId: project.id,
      },
    }),
  ]);

  console.log('✅ Created sections');

  // Create demo tasks
  const tasks = [
    {
      title: 'Set up your development environment',
      description: 'Clone the repo, install dependencies, and run the dev servers',
      sectionId: done.id,
      position: 0,
      completed: true,
    },
    {
      title: 'Explore the API documentation',
      description: 'Visit /api/docs to see the Swagger documentation',
      sectionId: done.id,
      position: 1,
      completed: true,
    },
    {
      title: 'Create your first project',
      description: 'Click the + button to create a new project',
      sectionId: inProgress.id,
      position: 0,
    },
    {
      title: 'Add sections to organize your work',
      description: 'Create columns like Backlog, To Do, In Progress, Done',
      sectionId: todo.id,
      position: 0,
    },
    {
      title: 'Create tasks and subtasks',
      description: 'Break down your work into manageable pieces',
      sectionId: todo.id,
      position: 1,
    },
    {
      title: 'Use labels to categorize tasks',
      description: 'Create labels like Bug, Feature, Urgent, etc.',
      sectionId: backlog.id,
      position: 0,
    },
    {
      title: 'Invite team members',
      description: 'Collaborate with others on your projects',
      sectionId: backlog.id,
      position: 1,
    },
  ];

  for (const taskData of tasks) {
    await prisma.task.create({
      data: {
        ...taskData,
        projectId: project.id,
      },
    });
  }

  console.log('✅ Created demo tasks');

  // Create demo labels
  const labels = [
    { name: 'Bug', color: '#EF4444', userId: user.id },
    { name: 'Feature', color: '#3B82F6', userId: user.id },
    { name: 'Enhancement', color: '#10B981', userId: user.id },
    { name: 'Documentation', color: '#F59E0B', userId: user.id },
    { name: 'Urgent', color: '#DC2626', userId: user.id },
  ];

  for (const labelData of labels) {
    await prisma.label.create({
      data: labelData,
    });
  }

  console.log('✅ Created demo labels');

  // Create user settings
  await prisma.userSettings.create({
    data: {
      userId: user.id,
      theme: 'system',
      notificationsEnabled: true,
      emailNotifications: true,
    },
  });

  console.log('✅ Created user settings');

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
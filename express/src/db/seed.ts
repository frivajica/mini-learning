import bcrypt from 'bcrypt';
import { db } from './index.js';
import { users, posts } from './schema.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

async function seed() {
  logger.info('Starting database seeding...');

  const hashedPassword = await bcrypt.hash('admin123', config.bcrypt.rounds);

  const [admin] = await db
    .insert(users)
    .values({
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    })
    .returning();

  const [user] = await db
    .insert(users)
    .values({
      email: 'user@example.com',
      name: 'Regular User',
      password: hashedPassword,
      role: 'USER',
    })
    .returning();

  await db.insert(posts).values([
    {
      title: 'Welcome to the API',
      content: 'This is a sample post to demonstrate the API.',
      authorId: admin.id,
      published: true,
    },
    {
      title: 'Getting Started',
      content: 'Learn how to use this production-ready Express API.',
      authorId: user.id,
      published: true,
    },
  ]);

  logger.info('Seeding complete!');
  logger.info({ email: admin.email }, 'Admin user created');
  logger.info({ email: user.email }, 'Regular user created');
  logger.info('Password: admin123');
}

seed()
  .catch((e) => {
    logger.error({ err: e }, 'Seeding failed');
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });

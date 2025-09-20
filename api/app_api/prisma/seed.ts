/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();

  const salt = 10;
  const password = 'password';
  const hashedPassword = await hash(password, salt);

  await prisma.user.createMany({
    data: [
      {
        email: 'ala.makota@example.com',
        username: 'Ala Makota',
        password: hashedPassword
      }
    ]
  });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    throw new Error('Błąd w głównej funkcji');
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await prisma.$disconnect();
  });

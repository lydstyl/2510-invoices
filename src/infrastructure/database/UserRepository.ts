import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { User, UserWithoutPassword } from '../../domain/entities/User';
import { prisma } from './prisma';

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { email } }) as User | null;
  }

  async findById(id: string): Promise<UserWithoutPassword | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user as UserWithoutPassword | null;
  }
}

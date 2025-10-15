import { ICategoryRepository } from '../../domain/interfaces/ICategoryRepository';
import { Category, CreateCategoryDTO } from '../../domain/entities/Category';
import { prisma } from './prisma';

export class CategoryRepository implements ICategoryRepository {
  async create(data: CreateCategoryDTO): Promise<Category> {
    return await prisma.category.create({ data }) as Category;
  }

  async findById(id: string): Promise<Category | null> {
    return await prisma.category.findUnique({ where: { id } }) as Category | null;
  }

  async findAll(): Promise<Category[]> {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' },
    }) as Category[];
  }

  async findByName(name: string): Promise<Category | null> {
    return await prisma.category.findUnique({ where: { name } }) as Category | null;
  }
}

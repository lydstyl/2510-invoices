import { Category, CreateCategoryDTO } from '../entities/Category';

export interface ICategoryRepository {
  create(data: CreateCategoryDTO): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findAll(): Promise<Category[]>;
  findByName(name: string): Promise<Category | null>;
}

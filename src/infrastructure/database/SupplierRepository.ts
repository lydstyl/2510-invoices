import { ISupplierRepository } from '../../domain/interfaces/ISupplierRepository';
import { Supplier, CreateSupplierDTO } from '../../domain/entities/Supplier';
import { prisma } from './prisma';

export class SupplierRepository implements ISupplierRepository {
  async create(data: CreateSupplierDTO): Promise<Supplier> {
    return await prisma.supplier.create({ data }) as Supplier;
  }

  async findById(id: string): Promise<Supplier | null> {
    return await prisma.supplier.findUnique({ where: { id } }) as Supplier | null;
  }

  async findAll(): Promise<Supplier[]> {
    return await prisma.supplier.findMany({
      orderBy: { name: 'asc' },
    }) as Supplier[];
  }

  async findByName(name: string): Promise<Supplier | null> {
    return await prisma.supplier.findUnique({ where: { name } }) as Supplier | null;
  }
}

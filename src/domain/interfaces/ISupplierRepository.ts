import { Supplier, CreateSupplierDTO } from '../entities/Supplier';

export interface ISupplierRepository {
  create(data: CreateSupplierDTO): Promise<Supplier>;
  findById(id: string): Promise<Supplier | null>;
  findAll(): Promise<Supplier[]>;
  findByName(name: string): Promise<Supplier | null>;
}

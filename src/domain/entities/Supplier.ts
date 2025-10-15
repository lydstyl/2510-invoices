export interface Supplier {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSupplierDTO {
  name: string;
}

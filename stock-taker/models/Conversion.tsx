export interface Conversion {
  id: number;
  createdAt: string;
  inputProduct: number;
  outputProducts: number[];
  status: string;
  completedAt: string;
  createdBy: string;
}

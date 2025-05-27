export interface Conversion {
  id: number;
  created_at: string;
  input_product: number;
  output_products: number[];
  status: string;
  completed_at: string;
  created_by: string;
}

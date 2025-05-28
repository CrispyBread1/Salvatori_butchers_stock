export interface Conversion {
  id: string; // UUID from Supabase
  created_at: string;
  input_product: number;
  output_products: number[] | null;
  status: string;
  completed_at: string | null;
  created_by: string;
}


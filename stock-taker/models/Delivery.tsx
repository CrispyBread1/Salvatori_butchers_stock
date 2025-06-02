export interface Delivery {
  id: string;
  created_at: string;
  product: number;
  receipt_image: string;
  quantity: number;
  notes: string;
  temperature: number;
  driver_name: string;
  license_plate: string;
  created_by: string;
  batch_code: string;
}

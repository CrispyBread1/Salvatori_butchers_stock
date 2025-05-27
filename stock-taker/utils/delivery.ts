import { supabase } from '@/utils/supabaseClient';

export async function submitDelivery(productId: number, createdBy: string, quantity: number, notes: string, temperature: number, driverName: string, licensePlate: string) {
  const entry = {
    product: productId,
    created_by: createdBy,
    quantity: quantity,
    notes: notes,
    temperature: temperature,
    driver_name: driverName,
    license_plate: licensePlate,
  };

  const { error } = await supabase.from('deliveries').insert(entry);

  if (error) {
    console.error('Error inserting delivery:', error);
    throw error;
  }
}

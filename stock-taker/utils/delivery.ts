import { Delivery } from '@/models/Delivery';
import { supabase } from '@/utils/supabaseClient';

export async function getAllDeliveries() {
  try {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return [];
    }

    console.log(data);
    return data as Delivery[];
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return [];
  }
}


export async function submitDelivery(productId: number, createdBy: string, quantity: number, notes: string, temperature: number, driverName: string, licensePlate: string, batchCode: string) {
  const entry = {
    product: productId,
    created_by: createdBy,
    quantity: quantity,
    notes: notes,
    temperature: temperature,
    driver_name: driverName,
    license_plate: licensePlate,
    batch_code: batchCode
  };

  const { error } = await supabase.from('deliveries').insert(entry);

  if (error) {
    console.error('Error inserting delivery:', error);
    throw error;
  }
}

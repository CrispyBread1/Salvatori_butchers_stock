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

//  supplier: string;
export async function submitDelivery(
  productId: number, 
  createdAt: string, 
  createdBy: string, 
  quantity: number, 
  notes: string, 
  vehicleTemperature: string, 
  productTemperature: string, 
  driverName: string, 
  licensePlate: string, 
  origin: string, 
  killDate: string, 
  useBy: string, 
  slaughterNumber: string, 
  cutNumber: string, 
  redTractor: boolean,
  rspca: boolean,
  organicAssured: boolean,
  supplier: string,
  batchCode: string
) 
  
  {
  const entry = {
    product: productId,
    created_at: createdAt,
    created_by: createdBy,
    quantity: quantity,
    notes: notes,
    vehicle_temperature: vehicleTemperature,
    product_temperature: productTemperature,
    driver_name: driverName,
    license_plate: licensePlate,
    origin: origin,
    kill_date: killDate,
    use_by: useBy,
    slaughter_number: slaughterNumber,
    cut_number: cutNumber,
    red_tractor: redTractor,
    rspca: rspca,
    organic_assured: organicAssured,
    supplier: supplier,
    batch_code: batchCode
  };

  const { error } = await supabase.from('deliveries').insert(entry);

  if (error) {
    console.error('Error inserting delivery:', error);
    throw error;
  }
}

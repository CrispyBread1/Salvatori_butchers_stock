import { supabase } from '@/utils/supabaseClient';

export async function submitStartConversion(inputProductId: number, status: string, createdBy: string) {
  const entry = {
    input_product: inputProductId,
    status: status,
    created_by: createdBy,
  };

  const { data, error } = await supabase
    .from('conversions')
    .insert(entry)
    .select('id')
    .single();

  if (error) {
    console.error('Error inserting conversion:', error);
    throw error;
  }

  return data.id;
}

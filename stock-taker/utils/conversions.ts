import { Conversion } from '@/models/Conversion';
import { supabase } from '@/utils/supabaseClient';

export async function getActiveConversionByUserId(userId: string) {
  try {
    const { data, error } = await supabase
      .from('conversions')
      .select('*')
      .eq('status', 'in_progress') 
      .eq('created_by', userId) 

    if (!error && data) {
      return data as Conversion[];
    }
  } catch (error) {
    return []
  }
}

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

export async function updateConversion(conversionId: string, data: number[]) {
  const timestamp = new Date().toISOString();
  const { error } = await supabase
    .from('conversions')
    .update({ output_products: data, completed_at: timestamp})
    .eq('id', conversionId);

  if (error) {
    console.error(`Failed to update conversion ${conversionId}:`, error);
    throw error;
  }
}

import { supabase } from '@/utils/supabaseClient';

export async function submitInputConversion(productId: number, quantity: number, type: string, conversionId: number) {
  const entry = {
    product_id: productId,
    quantity: quantity,
    type: type,
    conversion_id: conversionId,
  };

  const { error } = await supabase.from('conversion_items').insert(entry);

  if (error) {
    console.error('Error inserting delivery:', error);
    throw error;
  }
}

import { ConversionItem } from '@/models/ConversionItem';
import { supabase } from '@/utils/supabaseClient';

export async function getActiveConversionItemsByConversionId(conversionId: string) {
  try {
    const { data, error } = await supabase
      .from('conversion_items')
      .select('*')
      .eq('conversion_id', conversionId) 

    if (!error && data) {
      return data as ConversionItem[];
    }
  } catch (error) {
    return []
  }
}

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

import { supabase } from '@/utils/supabaseClient';

export async function submitStockTakeEntry(data: Record<string, string>, category: string, timestamp: string, userId: string) {
  const entry = {
    take: data,
    date: timestamp,
    product_category: category,
    created_by: userId,
  };

  const { error } = await supabase.from('stock_takes').insert(entry);

  if (error) {
    console.error('Error inserting stock take:', error);
    throw error;
  }
}

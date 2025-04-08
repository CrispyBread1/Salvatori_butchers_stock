import { supabase } from '@/utils/supabaseClient';

export async function updateProductStocks(data: Record<string, string>) {
  const updates = Object.entries(data).map(([product_id, stock_count]) => ({
    id: parseInt(product_id),
    stock_count: stock_count,
  }));

  // Batch update (you may need to loop individually depending on Supabase limitations)
  for (const update of updates) {
    const { error } = await supabase
      .from('products')
      .update({ stock_count: update.stock_count })
      .eq('id', update.id);

    if (error) {
      console.error(`Failed to update product ${update.id}:`, error);
      throw error;
    }
  }
}

import { Product } from '@/models/Product';
import { supabase } from '@/utils/supabaseClient';

export async function getProductsByCategory(category: string) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('stock_category', category) 
      .order('product_category', { ascending: true });

    if (!error && data) {
      return data as Product[];
    }
  } catch (error) {
    return []
  }
}
export async function getProductById(productId: number): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .limit(1)
      .single(); // Fetch just one record

    if (error) {
      console.error('Supabase error:', error);
      return null;
    }

    return data as Product;
  } catch (error) {
    console.error('Exception in getProductById:', error);
    return null;
  }
}






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

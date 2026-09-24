import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

interface SectionRule {
  slug: string;
  keywords: string[];
}

const SECTIONS: SectionRule[] = [
  { slug: 'combos', keywords: ['combo', 'promo', 'oferta', 'happy hour', '2x1'] },
  { slug: 'platos-fuertes', keywords: ['pollo', 'broaster', 'hamburguesa', 'alita', 'presa', 'comida', 'platillo', 'fritura', 'parrilla', 'carne', 'chicharron', 'lomo'] },
  { slug: 'postres', keywords: ['postre', 'dulce', 'helado', 'pie', 'torta'] },
  { slug: 'ensaladas', keywords: ['ensalada', 'verdura', 'vegetal', 'salad'] },
  { slug: 'salsas', keywords: ['salsa', 'crema', 'aderezo', 'mayonesa', 'ketchup', 'mostaza'] },
  { slug: 'caldos', keywords: ['caldo', 'sopa', 'consome'] },
  { slug: 'platos-a-la-carta', keywords: ['plato a la carta', 'a la carta'] },
  { slug: 'cocteles', keywords: ['trago', 'coctel', 'licor', 'ron', 'pisco', 'vodka', 'whisky', 'marciano', 'mike'] },
  { slug: 'bebidas', keywords: ['gaseosa', 'bebida', 'refresco', 'cola', 'agua', 'jugo', 'cerveza'] },
];

function matchCategorySlug(title: string): string | null {
  const lower = (title || '').toLowerCase();
  for (const s of SECTIONS) {
    if (s.keywords.some((kw) => lower.includes(kw))) return s.slug;
  }
  return null;
}

export async function POST() {
  const supabase = createAdminClient();

  const [categoriesRes, productsRes] = await Promise.all([
    supabase.from('categories').select('id, slug'),
    supabase.from('product_mappings').select('*'),
  ]);

  if (categoriesRes.error) return NextResponse.json({ error: categoriesRes.error.message }, { status: 500 });
  if (productsRes.error) return NextResponse.json({ error: productsRes.error.message }, { status: 500 });

  const categories = categoriesRes.data || [];
  const slugToId = new Map(categories.map((c: any) => [c.slug, c.id]));
  const defaultCatId = categories[0]?.id || null;

  const products = productsRes.data || [];
  let updatedCount = 0;

  for (const p of products) {
    if (!p.category_id) {
      const matchedSlug = matchCategorySlug(p.title);
      const targetCatId = (matchedSlug ? slugToId.get(matchedSlug) : null) || defaultCatId;
      if (targetCatId) {
        await supabase
          .from('product_mappings')
          .update({ category_id: targetCatId })
          .eq('id', p.id);
        updatedCount++;
      }
    }
  }

  return NextResponse.json({ success: true, updated: updatedCount, total: products.length });
}

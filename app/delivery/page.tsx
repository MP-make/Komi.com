"use client";
import { useMemo } from 'react';
import { useProductStore } from '@/lib/stores/products';
import { useUIStore } from '@/lib/stores/ui';
import LandingHeader from '@/components/landing/LandingHeader';
import HeroSection from '@/components/landing/HeroSection';
import FuegoSection from '@/components/landing/FuegoSection';
import CommunitySection from '@/components/landing/CommunitySection';
import ContactBlock from '@/components/landing/ContactBlock';
import { CartDrawer } from '@/components/shared/CartDrawer';
import DailyMenuModal from '@/components/shared/DailyMenuModal';

export default function RestaurantStorefrontPage() {
  const products = useProductStore((s) => s.products);
  const { isCartOpen, setIsCartOpen } = useUIStore();

  const bebidas = useMemo(() => products.filter(p => {
    const cat = (p.category || '').toLowerCase();
    return cat.includes('bebida') || cat.includes('gaseosa') || cat.includes('cerveza') || cat.includes('trago') || cat.includes('licor');
  }), [products]);

  return (
    <div className="min-h-screen relative bg-black">
      {/* Header restaurant */}
      <LandingHeader />

      {/* Hero */}
      <HeroSection />

      {/* Bloque comida */}
      <FuegoSection products={products} />

      {/* Comunidad */}
      <CommunitySection />

      {/* Contacto */}
      <ContactBlock />

      {/* Cart Drawer */}
      <CartDrawer visible={isCartOpen} onClose={() => setIsCartOpen(false)} bebidas={bebidas} />

      {/* Daily Menu Modal */}
      <DailyMenuModal />
    </div>
  );
}

"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AdminCategories from "@/components/admin/sections/CategoriesSection";
import AdminProducts from "@/components/admin/sections/ProductsSection";
import AdminUnifiedMenu from "@/components/admin/sections/MenuUnifiedSection";

function MenuContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "products";

  if (tab === "categories") {
    return <AdminCategories />;
  }

  if (tab === "menu" || tab === "daily" || tab === "schedules") {
    return <AdminUnifiedMenu />;
  }

  // Default: Productos
  return <AdminProducts />;
}

export default function AdminMenuPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <div className="w-9 h-9 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}

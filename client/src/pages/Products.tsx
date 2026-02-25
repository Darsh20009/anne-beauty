import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";

export default function Products() {
  const { data: products, isLoading } = useProducts();
  const [search, setSearch] = useState("");
  const { t, language } = useLanguage();

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <Layout>
      <div className="container py-12 sm:py-16 md:py-20 lg:py-24">
        <div className={`flex flex-col md:flex-row justify-between items-end mb-12 sm:mb-14 md:mb-16 lg:mb-20 gap-6 sm:gap-8 border-b border-black/5 pb-8 sm:pb-10 md:pb-12 ${language === 'ar' ? '' : 'md:flex-row-reverse'}`}>
          <div className={language === 'ar' ? "text-right" : "text-left"}>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-2 sm:mb-3 md:mb-4 uppercase tracking-tighter">{t('fullCollection')}</h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg font-light italic">{language === 'ar' ? 'تصفح أحدث التصاميم العصرية' : 'Browse our latest modern designs'}</p>
          </div>
          <div className="relative w-full md:w-auto md:min-w-[320px] lg:min-w-[400px]">
            <Search className={`absolute ${language === 'ar' ? 'right-3 sm:right-4' : 'left-3 sm:left-4'} top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-black/40`} />
            <Input 
              placeholder={t('searchPlaceholder')}
              className={`${language === 'ar' ? 'pr-10 sm:pr-12' : 'pl-10 sm:pl-12'} bg-white border border-black/10 h-11 sm:h-12 md:h-13 lg:h-14 rounded-none focus-visible:ring-black focus-visible:border-black text-sm sm:text-base md:text-lg`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 sm:py-24 md:py-32">
            <p className="text-xl sm:text-2xl font-light text-muted-foreground italic">{t('noResults')}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, Grid3X3, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function Products() {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useQuery<any[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });
  const [location] = useLocation();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const searchParam = urlParams.get('search') || '';
  const categoryParam = urlParams.get('category') || '';

  const [search, setSearch] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState("default");
  const [gridCols, setGridCols] = useState(4);

  useEffect(() => {
    if (searchParam) setSearch(searchParam);
  }, [searchParam]);

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [categoryParam]);

  const filteredProducts = useMemo(() => {
    let result = products || [];
    
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "name") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "newest") {
      result = [...result].reverse();
    }

    return result;
  }, [products, search, selectedCategory, sortBy]);

  return (
    <Layout>
      <div className="bg-white min-h-screen">
        {/* Page Header */}
        <div className="bg-gradient-to-b from-primary/5 to-white border-b">
          <div className="container px-3 sm:px-4 py-6 sm:py-8">
            <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${isRTL ? '' : ''}`}>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900" data-testid="heading-products">
                  {selectedCategory 
                    ? categories?.find(c => c.slug === selectedCategory)?.name || (isRTL ? 'المتجر' : 'Shop')
                    : (isRTL ? 'جميع المنتجات' : 'All Products')}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {filteredProducts.length} {isRTL ? 'منتج' : 'products'}
                  {search && <span> {isRTL ? `لـ "${search}"` : `for "${search}"`}</span>}
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400`} />
                  <Input 
                    placeholder={isRTL ? 'بحث...' : 'Search...'}
                    className={`${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} bg-white border-gray-200 h-10 rounded-xl text-sm focus-visible:ring-primary/30`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    data-testid="input-product-search"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container px-3 sm:px-4 py-4 sm:py-6">
          {/* Category Filters & Sort */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSelectedCategory("")}
                className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  !selectedCategory 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                data-testid="filter-all"
              >
                {isRTL ? 'الكل' : 'All'}
              </button>
              {categories?.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.slug ? "" : cat.slug)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.slug 
                      ? 'bg-primary text-white shadow-md shadow-primary/20' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  data-testid={`filter-category-${cat.slug}`}
                >
                  {cat.image && <img src={cat.image} alt="" className="w-5 h-5 rounded-full object-cover" />}
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Sort & Grid Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`h-9 px-3 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-600 focus:ring-primary/30 focus:border-primary/50 ${isRTL ? 'text-right' : 'text-left'}`}
                data-testid="select-sort"
              >
                <option value="default">{isRTL ? 'الترتيب الافتراضي' : 'Default'}</option>
                <option value="price-asc">{isRTL ? 'السعر: من الأقل' : 'Price: Low to High'}</option>
                <option value="price-desc">{isRTL ? 'السعر: من الأعلى' : 'Price: High to Low'}</option>
                <option value="newest">{isRTL ? 'الأحدث' : 'Newest'}</option>
                <option value="name">{isRTL ? 'الاسم' : 'Name'}</option>
              </select>
              <div className="hidden md:flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-0.5">
                <button onClick={() => setGridCols(3)} className={`p-1.5 rounded-lg transition-colors ${gridCols === 3 ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`} data-testid="grid-3">
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button onClick={() => setGridCols(4)} className={`p-1.5 rounded-lg transition-colors ${gridCols === 4 ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`} data-testid="grid-4">
                  <Grid3X3 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className={`grid grid-cols-2 sm:grid-cols-2 ${gridCols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-3 lg:grid-cols-4'} gap-3 sm:gap-4`}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="aspect-[4/5] bg-gray-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <motion.div 
              layout
              className={`grid grid-cols-2 sm:grid-cols-2 ${gridCols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-3 lg:grid-cols-4'} gap-3 sm:gap-4`}
            >
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-16 sm:py-24">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-lg font-semibold text-gray-600 mb-2">{t('noResults')}</p>
              <p className="text-sm text-gray-400">{isRTL ? 'حاولي تغيير كلمات البحث أو الفئة' : 'Try changing your search or category filter'}</p>
              {(search || selectedCategory) && (
                <Button 
                  variant="outline" 
                  className="mt-4 rounded-xl"
                  onClick={() => { setSearch(""); setSelectedCategory(""); }}
                  data-testid="button-clear-filters"
                >
                  {isRTL ? 'مسح الفلاتر' : 'Clear Filters'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

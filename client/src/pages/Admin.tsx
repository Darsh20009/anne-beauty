import { Layout } from "@/components/Layout";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { useProducts, useCreateProduct } from "@/hooks/use-products";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import React, { useState, useMemo, memo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type InsertProduct, orderStatuses, employeePermissions, insertUserSchema, type InsertUser } from "@shared/schema";
import { api } from "@shared/routes";
import { Loader2, Plus, DollarSign, ShoppingCart, TrendingUp, BarChart3, ArrowUpRight, Trash2, Search, Filter, ChevronDown, CheckCircle2, XCircle, Truck, PackageCheck, AlertCircle, LayoutGrid, Tag, Edit, ArrowRight, LogOut, Package, Building, User as UserIcon, History, Monitor, Clock } from "lucide-react";
import { Link } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarProvider, useSidebar } from "@/components/ui/sidebar"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Components extracted to prevent hook issues

const StatsCards = memo(() => {
  const { data: stats, isLoading } = useQuery({ 
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
       const res = await fetch("/api/admin/stats");
       if (!res.ok) throw new Error("Failed to fetch stats");
       return res.json();
    }
  });

  if (isLoading) return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {[1, 2, 3, 4].map(i => <Card key={i} className="h-32 animate-pulse bg-secondary/20" />)}
    </div>
  );

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="hover-elevate border-black/5 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">إجمالي المبيعات</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{Number(stats?.totalSales || 0).toLocaleString()} <span className="text-xs">ر.س</span></div>
          </CardContent>
        </Card>
        
        <Card className="hover-elevate border-black/5 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">صافي الربح</CardTitle>
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{Number(stats?.netProfit || 0).toLocaleString()} <span className="text-xs">ر.س</span></div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="text-[8px] font-bold opacity-40 uppercase tracking-tighter">يومي: {Number(stats?.dailySales || 0).toLocaleString()}</div>
              <div className="text-[8px] font-bold opacity-40 uppercase tracking-tighter text-left">شهري: {Number(stats?.monthlySales || 0).toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate border-black/5 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">إجمالي الطلبات</CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{stats?.totalOrders || 0}</div>
          </CardContent>
        </Card>

        <Card className="hover-elevate border-black/5 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">متوسط الطلب</CardTitle>
            <div className="p-2 bg-orange-50 rounded-lg">
              <BarChart3 className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">
              {stats?.totalOrders ? (stats.totalSales / stats.totalOrders).toFixed(2) : 0} <span className="text-xs">ر.س</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="border-black/5 shadow-2xl p-6 overflow-hidden relative group min-h-[400px] flex flex-col justify-between bg-[#c0c7cf]">
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-[100px] animate-pulse duration-[4000ms]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full -ml-24 -mb-24 blur-[80px] animate-pulse duration-[3000ms]" />
          <div className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
          
          <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between mb-8 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-2 h-8 bg-primary rounded-full animate-bounce" />
                  <div className="absolute inset-0 bg-primary blur-md opacity-50 animate-pulse" />
                </div>
                <div>
                  <CardTitle className="text-lg font-black uppercase tracking-[0.2em] text-black">
                    الأكثر مبيعاً
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="h-[1px] w-8 bg-primary/50" />
                    <p className="text-[10px] text-primary/80 font-black uppercase tracking-widest italic">Hall of Fame</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl p-3 rounded-2xl border border-white/10 transition-all duration-500 group-hover:scale-125 group-hover:rotate-[360deg] shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>

          <div className="h-[280px] w-full relative z-10 mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.topProducts || []} layout="vertical" margin={{ left: 10, right: 30 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#fff" />
                    <stop offset="100%" stopColor="#888" />
                  </linearGradient>
                  <linearGradient id="barGradientSecondary" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#444" />
                    <stop offset="100%" stopColor="#222" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="0" horizontal={false} vertical={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 12, fontWeight: '900', fill: '#000' }} 
                  width={70}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 10 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-black/90 backdrop-blur-2xl p-4 border border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-3xl animate-in fade-in zoom-in duration-300 ring-1 ring-white/10">
                          <p className="text-[10px] font-black uppercase mb-2 text-primary tracking-widest">{payload[0].payload.name}</p>
                          <div className="flex items-end gap-3">
                            <span className="text-3xl font-black text-white leading-none">{payload[0].value}</span>
                            <span className="text-[10px] text-white/40 font-bold uppercase mb-1">Units Sold</span>
                          </div>
                          <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-green-500 animate-ping" />
                            <span className="text-[8px] font-bold text-green-500 uppercase tracking-tighter">Live Trending</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="quantity" radius={[0, 20, 20, 0]} barSize={40} filter="url(#glow)">
                  {(stats?.topProducts || []).map((_entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? "url(#barGradient)" : "url(#barGradientSecondary)"} 
                      className="transition-all duration-700 hover:opacity-100 opacity-90 cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Bottom decorative bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30" />
        </Card>

        <Card className="border-black/5 bg-white shadow-sm p-6">
          <CardHeader className="px-0 pt-0 mb-6">
            <CardTitle className="text-sm font-black uppercase tracking-widest">حالات الطلبات</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            {Object.entries(stats?.orderStatusCounts || {}).map(([status, count]: [string, any]) => (
              <div key={status} className="flex items-center justify-between p-4 bg-secondary/20 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'new' ? 'bg-primary' : 
                    status === 'processing' ? 'bg-blue-500' : 
                    status === 'shipped' ? 'bg-orange-500' : 
                    status === 'cancelled' ? 'bg-destructive' :
                    status === 'returned' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <span className="text-sm font-bold uppercase tracking-widest">
                    {status === 'new' ? 'جديد' : 
                     status === 'processing' ? 'قيد التنفيذ' : 
                     status === 'shipped' ? 'تم الشحن' : 
                     status === 'cancelled' ? 'ملغي' :
                     status === 'returned' ? 'مسترجع' : 'مكتمل'}
                  </span>
                </div>
                <span className="font-black">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
});

const EditProductDialog = memo(({ product, categories, open, onOpenChange }: any) => {
  const { toast } = useToast();
  const [variants, setVariants] = useState<any[]>([]);
  const [editCustomOptions, setEditCustomOptions] = useState<any[]>([]);
  const [editAllowFileUpload, setEditAllowFileUpload] = useState(false);
  const [editAllowNote, setEditAllowNote] = useState(false);
  const lastProductIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (open && product && product.id !== lastProductIdRef.current) {
      setVariants(product.variants || []);
      setEditCustomOptions(product.customOptions || []);
      setEditAllowFileUpload(product.allowFileUpload || false);
      setEditAllowNote(product.allowNote || false);
      lastProductIdRef.current = product.id;
    } else if (!open) {
      lastProductIdRef.current = null;
    }
  }, [open, product]);
  
  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || "0",
      cost: product?.cost || "0",
      images: product?.images || [],
      categoryId: (product as any)?.categoryId || "",
      variants: (product as any)?.variants || [],
      isFeatured: product?.isFeatured || false,
    } as any
  });

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number | null = null) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: "الملف كبير جداً", 
        description: "يرجى اختيار صورة أقل من 5 ميجابايت", 
        variant: "destructive" 
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Upload failed");
      }
      
      const { url } = await res.json();
      
      if (typeof index === "number" && index >= 0) {
        // Variant image
        updateVariant(index, "image", url);
      } else {
        // Product images - append to array
        const currentImages = form.getValues("images") || [];
        form.setValue("images", [...currentImages, url]);
      }
      
      toast({ title: "تم رفع الصورة بنجاح" });
    } catch (error: any) {
      toast({ 
        title: "خطأ في الرفع", 
        description: error.message || "تعذر رفع الصورة. حاول مرة أخرى.", 
        variant: "destructive" 
      });
    }
  };

  const removeProductImage = (index: number) => {
    const currentImages = form.getValues("images") || [];
    form.setValue("images", currentImages.filter((_: any, i: number) => i !== index));
  };

  const addVariant = () => {
    setVariants([...variants, { color: "", size: "", sku: `SKU-${Date.now()}`, stock: 0, image: "" }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const editAddCustomOption = () => {
    setEditCustomOptions([...editCustomOptions, {
      id: `opt-${Date.now()}`,
      name: "",
      type: "single" as const,
      required: false,
      options: [{ label: "", priceAdjustment: 0 }],
    }]);
  };

  const editRemoveCustomOption = (index: number) => {
    setEditCustomOptions(editCustomOptions.filter((_: any, i: number) => i !== index));
  };

  const editUpdateCustomOption = (index: number, field: string, value: any) => {
    const updated = [...editCustomOptions];
    updated[index] = { ...updated[index], [field]: value };
    setEditCustomOptions(updated);
  };

  const editAddOptionChoice = (optIndex: number) => {
    const updated = [...editCustomOptions];
    updated[optIndex] = {
      ...updated[optIndex],
      options: [...updated[optIndex].options, { label: "", priceAdjustment: 0 }],
    };
    setEditCustomOptions(updated);
  };

  const editRemoveOptionChoice = (optIndex: number, choiceIndex: number) => {
    const updated = [...editCustomOptions];
    updated[optIndex] = {
      ...updated[optIndex],
      options: updated[optIndex].options.filter((_: any, i: number) => i !== choiceIndex),
    };
    setEditCustomOptions(updated);
  };

  const editUpdateOptionChoice = (optIndex: number, choiceIndex: number, field: string, value: any) => {
    const updated = [...editCustomOptions];
    const choices = [...updated[optIndex].options];
    choices[choiceIndex] = { ...choices[choiceIndex], [field]: value };
    updated[optIndex] = { ...updated[optIndex], options: choices };
    setEditCustomOptions(updated);
  };

  const onSubmit = async (data: InsertProduct) => {
    try {
      const payload = {
        ...data,
        variants: variants.map(v => ({
          ...v,
          stock: Number(v.stock),
          cost: Number(v.cost || 0)
        })),
        price: data.price.toString(),
        cost: data.cost.toString(),
        customOptions: editCustomOptions.filter((o: any) => o.name && o.options.some((c: any) => c.label)),
        allowFileUpload: editAllowFileUpload,
        allowNote: editAllowNote,
      };

      await apiRequest("PATCH", `/api/products/${product.id}`, payload);
      toast({ title: "تم تحديث المنتج بنجاح" });
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
    } catch (e) {
      toast({ title: "خطأ", description: "فشل تحديث المنتج", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl rounded-none border-none shadow-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-right font-black uppercase tracking-tight">تعديل المنتج</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6 mt-8" dir="rtl">
           <div className="grid grid-cols-2 gap-6 text-right">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-black/40">اسم المنتج</Label>
                  <Input {...form.register("name")} className="rounded-none h-12 text-right" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-black/40">السعر الأساسي (ر.س)</Label>
                  <Input type="number" {...form.register("price")} className="rounded-none h-12 text-right" />
                </div>
              </div>

           <div className="grid grid-cols-2 gap-6 text-right">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-black/40">الفئة</Label>
                  <Select value={form.watch("categoryId" as any)} onValueChange={(v) => form.setValue("categoryId" as any, v)}>
                    <SelectTrigger className="rounded-none h-12 text-right">
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-black/40">التكلفة (ر.س)</Label>
                  <Input type="number" {...form.register("cost")} className="rounded-none h-12 text-right" />
                </div>
              </div>

           <div className="space-y-2 text-right">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-black/40">صور المنتج</Label>
                  <div className="relative">
                    <Button variant="outline" type="button" className="h-8 px-3 rounded-none flex gap-1 overflow-visible text-[9px]">
                      <Plus className="h-3 w-3" />
                      <span className="font-black uppercase">إضافة صورة</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(e)} 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                      />
                    </Button>
                  </div>
                </div>
                
                {/* Image Gallery */}
                <div className="grid grid-cols-6 gap-2 bg-secondary/5 p-3 border border-black/5">
                  {(form.watch("images") || []).map((img: string, idx: number) => (
                    <div key={idx} className="relative group">
                      <div className="aspect-square bg-secondary/20 rounded-none overflow-hidden border border-black/5">
                        <img src={img} alt={`صورة ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeProductImage(idx)}
                        className="absolute top-0 right-0 h-6 w-6 rounded-none bg-destructive/80 hover:bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {(!form.watch("images") || form.watch("images").length === 0) && (
                    <div className="col-span-6 text-center py-8 text-black/30">
                      <p className="text-[9px]">لم يتم رفع أي صور بعد</p>
                    </div>
                  )}
                </div>
                <p className="text-[8px] text-black/40 mt-1">يمكنك رفع عدة صور للمنتج. الصورة الأولى ستظهر في قائمة المنتجات</p>
              </div>

           <div className="space-y-2 text-right">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-black/40">الوصف التفصيلي</Label>
                <Textarea {...form.register("description")} className="rounded-none min-h-[100px] text-right" />
              </div>

           <div className="space-y-4 pt-4 border-t border-black/5 text-right">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">المتغيرات (الألوان والمقاسات والصور)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addVariant} className="rounded-none text-[10px] font-black uppercase tracking-widest h-8">
                    إضافة متغير <Plus className="mr-1 h-3 w-3" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {variants.map((v, i) => (
                    <div key={i} className="grid grid-cols-6 gap-3 items-end bg-secondary/10 p-4 border border-black/5">
                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold">اللون</Label>
                        <Input value={v.color} onChange={(e) => updateVariant(i, "color", e.target.value)} className="h-8 rounded-none text-xs text-right" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold">المقاس</Label>
                        <Input value={v.size} onChange={(e) => updateVariant(i, "size", e.target.value)} className="h-8 rounded-none text-xs text-right" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold">المخزون</Label>
                        <Input type="number" value={v.stock} onChange={(e) => updateVariant(i, "stock", parseInt(e.target.value))} className="h-8 rounded-none text-xs text-right" />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-[9px] font-bold">صورة المتغير</Label>
                        <div className="flex gap-2">
                          <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleImageUpload(e, i)} 
                            className="h-8 rounded-none text-[8px] pt-1.5 cursor-pointer" 
                          />
                          {v.image && (
                            <div className="w-8 h-8 border border-black/5 overflow-hidden shrink-0">
                              <img src={v.image} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(i)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

           <div className="space-y-4 pt-4 border-t border-black/5 text-right">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">خيارات مخصصة (أسئلة للعميل)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={editAddCustomOption} className="rounded-none text-[10px] font-black uppercase tracking-widest h-8">
                    إضافة سؤال <Plus className="mr-1 h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-4">
                  {editCustomOptions.map((opt: any, optIdx: number) => (
                    <div key={opt.id} className="bg-secondary/10 p-4 border border-black/5 space-y-3">
                      <div className="flex justify-between items-start gap-3">
                        <Button type="button" variant="ghost" size="icon" onClick={() => editRemoveCustomOption(optIdx)} className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <div className="col-span-1 space-y-1">
                            <Label className="text-[9px] font-bold">اسم السؤال / الخيار</Label>
                            <Input value={opt.name} onChange={(e) => editUpdateCustomOption(optIdx, "name", e.target.value)} className="h-8 rounded-none text-xs text-right" placeholder="مثال: عدد القلوسات" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[9px] font-bold">نوع الاختيار</Label>
                            <Select value={opt.type} onValueChange={(v) => editUpdateCustomOption(optIdx, "type", v)}>
                              <SelectTrigger className="h-8 rounded-none text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="single">اختيار واحد</SelectItem>
                                <SelectItem value="multiple">اختيار متعدد</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-end gap-2">
                            <div className="flex items-center gap-2">
                              <Switch checked={opt.required} onCheckedChange={(checked) => editUpdateCustomOption(optIdx, "required", checked)} />
                              <Label className="text-[9px] font-bold">مطلوب</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 mr-11">
                        <Label className="text-[9px] font-bold text-black/40">الاختيارات:</Label>
                        {opt.options.map((choice: any, choiceIdx: number) => (
                          <div key={choiceIdx} className="flex gap-2 items-center">
                            <Input value={choice.label} onChange={(e) => editUpdateOptionChoice(optIdx, choiceIdx, "label", e.target.value)} className="h-7 rounded-none text-xs text-right flex-1" placeholder="اسم الاختيار" />
                            <div className="flex items-center gap-1">
                              <Input type="number" value={choice.priceAdjustment} onChange={(e) => editUpdateOptionChoice(optIdx, choiceIdx, "priceAdjustment", Number(e.target.value))} className="h-7 rounded-none text-xs text-right w-20" placeholder="0" />
                              <span className="text-[8px] text-black/40 whitespace-nowrap">ر.س</span>
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => editRemoveOptionChoice(optIdx, choiceIdx)} className="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <Button type="button" variant="ghost" size="sm" onClick={() => editAddOptionChoice(optIdx)} className="h-7 text-[9px] text-primary">
                          <Plus className="h-3 w-3 ml-1" /> إضافة اختيار
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-black/5">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch id="editAllowFileUpload" checked={editAllowFileUpload} onCheckedChange={setEditAllowFileUpload} />
                  <Label htmlFor="editAllowFileUpload" className="text-[10px] font-black uppercase tracking-widest cursor-pointer">تفعيل إرفاق ملف من العميل</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch id="editAllowNote" checked={editAllowNote} onCheckedChange={setEditAllowNote} />
                  <Label htmlFor="editAllowNote" className="text-[10px] font-black uppercase tracking-widest cursor-pointer">تفعيل إضافة ملاحظة من العميل</Label>
                </div>
              </div>

           <Button type="submit" className="w-full h-14 rounded-none font-black uppercase tracking-widest text-lg">تحديث المنتج</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
});

const ProductsTable = memo(() => {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useQuery<any[]>({ queryKey: ["/api/categories"] });
  const createProduct = useCreateProduct();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [customOptions, setCustomOptions] = useState<any[]>([]);
  const [allowFileUpload, setAllowFileUpload] = useState(false);
  const [allowNote, setAllowNote] = useState(false);

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "0",
      cost: "0",
      images: [],
      categoryId: "",
      variants: [],
      isFeatured: false,
    } as any
  });

  useEffect(() => {
    if (editingProduct) {
      form.reset({
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        cost: editingProduct.cost,
        images: editingProduct.images || [],
        categoryId: (editingProduct as any).categoryId,
        isFeatured: editingProduct.isFeatured,
        variants: (editingProduct as any).variants || [],
      } as any);
      setVariants((editingProduct as any).variants || []);
      setCustomOptions(editingProduct.customOptions || []);
      setAllowFileUpload(editingProduct.allowFileUpload || false);
      setAllowNote(editingProduct.allowNote || false);
    } else {
      form.reset({
        name: "",
        description: "",
        price: "0",
        cost: "0",
        images: [],
        categoryId: "",
        variants: [],
        isFeatured: false,
      } as any);
      setVariants([]);
      setCustomOptions([]);
      setAllowFileUpload(false);
      setAllowNote(false);
    }
  }, [editingProduct]);

  const addVariant = () => {
    setVariants([...variants, { color: "", size: "", sku: `SKU-${Date.now()}`, stock: 0, image: "" }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const addCustomOption = () => {
    setCustomOptions([...customOptions, {
      id: `opt-${Date.now()}`,
      name: "",
      type: "single" as const,
      required: false,
      options: [{ label: "", priceAdjustment: 0 }],
    }]);
  };

  const removeCustomOption = (index: number) => {
    setCustomOptions(customOptions.filter((_: any, i: number) => i !== index));
  };

  const updateCustomOption = (index: number, field: string, value: any) => {
    const updated = [...customOptions];
    updated[index] = { ...updated[index], [field]: value };
    setCustomOptions(updated);
  };

  const addOptionChoice = (optIndex: number) => {
    const updated = [...customOptions];
    updated[optIndex] = {
      ...updated[optIndex],
      options: [...updated[optIndex].options, { label: "", priceAdjustment: 0 }],
    };
    setCustomOptions(updated);
  };

  const removeOptionChoice = (optIndex: number, choiceIndex: number) => {
    const updated = [...customOptions];
    updated[optIndex] = {
      ...updated[optIndex],
      options: updated[optIndex].options.filter((_: any, i: number) => i !== choiceIndex),
    };
    setCustomOptions(updated);
  };

  const updateOptionChoice = (optIndex: number, choiceIndex: number, field: string, value: any) => {
    const updated = [...customOptions];
    const choices = [...updated[optIndex].options];
    choices[choiceIndex] = { ...choices[choiceIndex], [field]: value };
    updated[optIndex] = { ...updated[optIndex], options: choices };
    setCustomOptions(updated);
  };

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast({ title: "تم حذف المنتج بنجاح" });
    }
  });

  const onSubmit = async (data: InsertProduct) => {
    try {
      const payload = {
        ...data,
        variants: variants.map(v => ({
          ...v,
          stock: Number(v.stock),
          cost: Number(v.cost || 0)
        })),
        price: data.price.toString(),
        cost: data.cost.toString(),
        customOptions: customOptions.filter((o: any) => o.name && o.options.some((c: any) => c.label)),
        allowFileUpload,
        allowNote,
      };

      if (editingProduct) {
        await apiRequest("PATCH", `/api/products/${editingProduct.id}`, payload);
        toast({ title: "تم تحديث المنتج بنجاح" });
      } else {
        await createProduct.mutateAsync(payload);
      }
      setOpen(false);
      setEditingProduct(null);
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
    } catch (e) {
      toast({ title: "خطأ", description: "فشل حفظ المنتج", variant: "destructive" });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number | null = null) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: "الملف كبير جداً", 
        description: "يرجى اختيار صورة أقل من 5 ميجابايت", 
        variant: "destructive" 
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Upload failed");
      }
      
      const { url } = await res.json();
      
      if (typeof index === "number" && index >= 0) {
        // Variant image
        updateVariant(index, "image", url);
      } else {
        // Product images - append to array
        const currentImages = form.getValues("images") || [];
        form.setValue("images", [...currentImages, url]);
      }
      
      toast({ title: "تم رفع الصورة بنجاح" });
    } catch (error: any) {
      toast({ 
        title: "خطأ في الرفع", 
        description: error.message || "تعذر رفع الصورة. حاول مرة أخرى.", 
        variant: "destructive" 
      });
    }
  };

  const removeProductImage = (index: number) => {
    const currentImages = form.getValues("images") || [];
    form.setValue("images", currentImages.filter((_: any, i: number) => i !== index));
  };

  if (isLoading) return <Loader2 className="animate-spin" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold uppercase tracking-tight text-right w-full">إدارة المخزون</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-none font-bold uppercase tracking-widest text-xs h-10 px-6">
              <Plus className="ml-2 h-4 w-4" /> إضافة منتج جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl rounded-none border-none shadow-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-right font-black uppercase tracking-tight">
                {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6 mt-8" dir="rtl">
              <div className="grid grid-cols-2 gap-6 text-right">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-black/40">اسم المنتج</Label>
                  <Input {...form.register("name")} className="rounded-none h-12 text-right" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-black/40">السعر الأساسي (ر.س)</Label>
                  <Input type="number" {...form.register("price")} className="rounded-none h-12 text-right" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 text-right">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-black/40">الفئة</Label>
                  <Select value={form.watch("categoryId" as any)} onValueChange={(v) => form.setValue("categoryId" as any, v)}>
                    <SelectTrigger className="rounded-none h-12 text-right">
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-black/40">التكلفة (ر.س)</Label>
                  <Input type="number" {...form.register("cost")} className="rounded-none h-12 text-right" />
                </div>
              </div>

              <div className="space-y-2 text-right">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-black/40">صور المنتج</Label>
                  <div className="relative">
                    <Button variant="outline" type="button" className="h-8 px-3 rounded-none flex gap-1 overflow-visible text-[9px]">
                      <Plus className="h-3 w-3" />
                      <span className="font-black uppercase">إضافة صورة</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(e)} 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                      />
                    </Button>
                  </div>
                </div>
                
                {/* Image Gallery */}
                <div className="grid grid-cols-6 gap-2 bg-secondary/5 p-3 border border-black/5">
                  {(form.watch("images") || []).map((img: string, idx: number) => (
                    <div key={idx} className="relative group">
                      <div className="aspect-square bg-secondary/20 rounded-none overflow-hidden border border-black/5">
                        <img src={img} alt={`صورة ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeProductImage(idx)}
                        className="absolute top-0 right-0 h-6 w-6 rounded-none bg-destructive/80 hover:bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {(!form.watch("images") || form.watch("images").length === 0) && (
                    <div className="col-span-6 text-center py-8 text-black/30">
                      <p className="text-[9px]">لم يتم رفع أي صور بعد</p>
                    </div>
                  )}
                </div>
                <p className="text-[8px] text-black/40 mt-1">يمكنك رفع عدة صور للمنتج. الصورة الأولى ستظهر في قائمة المنتجات</p>
              </div>

              <div className="space-y-2 text-right">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-black/40">الوصف التفصيلي</Label>
                <Textarea {...form.register("description")} className="rounded-none min-h-[100px] text-right" />
              </div>

              <div className="space-y-4 pt-4 border-t border-black/5 text-right">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">المتغيرات (الألوان والمقاسات والصور)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addVariant} className="rounded-none text-[10px] font-black uppercase tracking-widest h-8">
                    إضافة متغير <Plus className="mr-1 h-3 w-3" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {variants.map((v, i) => (
                    <div key={i} className="grid grid-cols-6 gap-3 items-end bg-secondary/10 p-4 border border-black/5">
                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold">اللون</Label>
                        <Input value={v.color} onChange={(e) => updateVariant(i, "color", e.target.value)} className="h-8 rounded-none text-xs text-right" placeholder="أسود" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold">المقاس</Label>
                        <Input value={v.size} onChange={(e) => updateVariant(i, "size", e.target.value)} className="h-8 rounded-none text-xs text-right" placeholder="L" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold">المخزون</Label>
                        <Input type="number" value={v.stock} onChange={(e) => updateVariant(i, "stock", parseInt(e.target.value))} className="h-8 rounded-none text-xs text-right" />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-[9px] font-bold">صورة المتغير</Label>
                        <div className="flex gap-2">
                          <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleImageUpload(e, i)} 
                            className="h-8 rounded-none text-[8px] pt-1.5 cursor-pointer" 
                          />
                          {v.image && (
                            <div className="w-8 h-8 border border-black/5 overflow-hidden shrink-0">
                              <img src={v.image} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(i)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-black/5 text-right">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">خيارات مخصصة (أسئلة للعميل)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addCustomOption} className="rounded-none text-[10px] font-black uppercase tracking-widest h-8">
                    إضافة سؤال <Plus className="mr-1 h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {customOptions.map((opt: any, optIdx: number) => (
                    <div key={opt.id} className="bg-secondary/10 p-4 border border-black/5 space-y-3">
                      <div className="flex justify-between items-start gap-3">
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeCustomOption(optIdx)} className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <div className="col-span-1 space-y-1">
                            <Label className="text-[9px] font-bold">اسم السؤال / الخيار</Label>
                            <Input value={opt.name} onChange={(e) => updateCustomOption(optIdx, "name", e.target.value)} className="h-8 rounded-none text-xs text-right" placeholder="مثال: عدد القلوسات" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[9px] font-bold">نوع الاختيار</Label>
                            <Select value={opt.type} onValueChange={(v) => updateCustomOption(optIdx, "type", v)}>
                              <SelectTrigger className="h-8 rounded-none text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="single">اختيار واحد</SelectItem>
                                <SelectItem value="multiple">اختيار متعدد</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-end gap-2">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={opt.required}
                                onCheckedChange={(checked) => updateCustomOption(optIdx, "required", checked)}
                              />
                              <Label className="text-[9px] font-bold">مطلوب</Label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mr-11">
                        <Label className="text-[9px] font-bold text-black/40">الاختيارات:</Label>
                        {opt.options.map((choice: any, choiceIdx: number) => (
                          <div key={choiceIdx} className="flex gap-2 items-center">
                            <Input
                              value={choice.label}
                              onChange={(e) => updateOptionChoice(optIdx, choiceIdx, "label", e.target.value)}
                              className="h-7 rounded-none text-xs text-right flex-1"
                              placeholder="اسم الاختيار"
                            />
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                value={choice.priceAdjustment}
                                onChange={(e) => updateOptionChoice(optIdx, choiceIdx, "priceAdjustment", Number(e.target.value))}
                                className="h-7 rounded-none text-xs text-right w-20"
                                placeholder="0"
                              />
                              <span className="text-[8px] text-black/40 whitespace-nowrap">ر.س</span>
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeOptionChoice(optIdx, choiceIdx)} className="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <Button type="button" variant="ghost" size="sm" onClick={() => addOptionChoice(optIdx)} className="h-7 text-[9px] text-primary">
                          <Plus className="h-3 w-3 ml-1" /> إضافة اختيار
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-black/5">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="allowFileUpload"
                    checked={allowFileUpload}
                    onCheckedChange={setAllowFileUpload}
                  />
                  <Label htmlFor="allowFileUpload" className="text-[10px] font-black uppercase tracking-widest cursor-pointer">تفعيل إرفاق ملف من العميل</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="allowNote"
                    checked={allowNote}
                    onCheckedChange={setAllowNote}
                  />
                  <Label htmlFor="allowNote" className="text-[10px] font-black uppercase tracking-widest cursor-pointer">تفعيل إضافة ملاحظة من العميل</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    id="isFeatured" 
                    checked={form.watch("isFeatured")} 
                    onCheckedChange={(checked) => form.setValue("isFeatured", checked)}
                  />
                  <Label htmlFor="isFeatured" className="text-[10px] font-black uppercase tracking-widest cursor-pointer">تمييز المنتج في الصفحة الرئيسية</Label>
                </div>
              </div>

              <Button type="submit" disabled={createProduct.isPending} className="w-full h-14 rounded-none font-black uppercase tracking-widest text-lg">
                {createProduct.isPending ? <Loader2 className="animate-spin" /> : editingProduct ? "تحديث المنتج" : "نشر المنتج"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-none border border-black/5 overflow-hidden bg-white shadow-sm">
        <div className="p-6 grid grid-cols-6 font-black uppercase tracking-widest text-[10px] bg-secondary/10 text-black/40 border-b border-black/5">
          <div className="text-right">المنتج</div>
          <div className="text-right">الفئة</div>
          <div className="text-right">السعر</div>
          <div className="text-right">المخزون</div>
          <div className="text-right">الحالة</div>
          <div className="text-right">الإجراءات</div>
        </div>
        <div className="divide-y divide-black/5">
          {products?.map(product => {
            const totalStock = (product as any).variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0;
            const category = categories?.find(c => c.id === (product as any).categoryId);
            return (
              <div key={product.id} className="p-6 grid grid-cols-6 items-center hover:bg-secondary/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-secondary/20 rounded-none overflow-hidden border border-black/5">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <PackageCheck className="w-4 h-4 m-4 opacity-20" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-xs">{product.name}</div>
                    <div className="text-[8px] font-black uppercase opacity-40">{(product as any).variants?.length || 0} خيارات متاحة</div>
                  </div>
                </div>
                <div className="text-[10px] font-black uppercase opacity-60">
                  {category?.name || "بدون فئة"}
                </div>
                <div className="font-black tracking-tighter text-xs">{Number(product.price).toLocaleString()} ر.س</div>
                <div className="font-bold text-xs">
                  <span className={totalStock === 0 ? "text-destructive" : totalStock < 5 ? "text-orange-500" : "text-green-600"}>
                    {totalStock}
                  </span>
                </div>
                <div className="flex gap-2">
                  {product.isFeatured && (
                    <Badge className="bg-black rounded-none text-[7px] font-black uppercase tracking-tighter">مميز</Badge>
                  )}
                  <Badge variant={totalStock > 0 ? "outline" : "destructive"} className="rounded-none text-[7px] font-black uppercase tracking-tighter">
                    {totalStock > 0 ? "متوفر" : "نفذ"}
                  </Badge>
                </div>
                <div className="flex gap-2 justify-start">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:bg-black hover:text-white rounded-none transition-all"
                    onClick={() => {
                      setEditingProduct(product);
                    }}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive rounded-none transition-all"
                    onClick={() => {
                      if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
                        deleteProductMutation.mutate(product.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {editingProduct && (
        <EditProductDialog 
          product={editingProduct} 
          categories={categories} 
          open={!!editingProduct} 
          onOpenChange={(open: boolean) => { if (!open) setEditingProduct(null); }} 
        />
      )}
    </div>
  );
});

const CategoriesTable = memo(() => {
  const { data: categories, isLoading } = useQuery<any[]>({ queryKey: ["/api/categories"] });
  const { toast } = useToast();
  const [newCat, setNewCat] = useState({ name: "", slug: "" });
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/categories", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setNewCat({ name: "", slug: "" });
      toast({ title: "تمت إضافة الفئة بنجاح" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "تم حذف الفئة" });
    }
  });

  const handleImageUpload = async (categoryId: string, file: File) => {
    setUploadingId(categoryId);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
        toast({ title: "تم تحديث صورة الفئة" });
      }
    } catch {
      toast({ title: "فشل رفع الصورة", variant: "destructive" });
    }
    setUploadingId(null);
  };

  if (isLoading) return <Loader2 className="animate-spin mx-auto" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold uppercase tracking-tight">إدارة الفئات</h2>
      </div>

      <Card className="rounded-none border-black/5 shadow-sm p-6 bg-secondary/10">
        <div className="grid grid-cols-3 gap-4" dir="rtl">
          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase opacity-40">اسم الفئة</Label>
            <Input 
              value={newCat.name} 
              onChange={e => setNewCat({...newCat, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
              className="rounded-none h-10"
              data-testid="input-category-name"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase opacity-40">المعرف (Slug)</Label>
            <Input value={newCat.slug} readOnly className="rounded-none h-10 bg-black/5" />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={() => createMutation.mutate(newCat)} 
              disabled={!newCat.name || createMutation.isPending}
              className="w-full rounded-none font-bold uppercase tracking-widest h-10"
              data-testid="button-add-category"
            >
              {createMutation.isPending ? <Loader2 className="animate-spin" /> : "إضافة فئة"}
            </Button>
          </div>
        </div>
      </Card>

      <div className="rounded-none border border-black/5 overflow-hidden bg-white">
        <div className="divide-y divide-black/5">
          {categories?.map(cat => (
            <div key={cat.id} className="p-4 flex justify-between items-center hover:bg-secondary/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-secondary/20 flex items-center justify-center group cursor-pointer border border-dashed border-black/10">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <Tag className="w-5 h-5 opacity-30" />
                  )}
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    {uploadingId === cat.id ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <span className="text-white text-[9px] font-bold">تغيير</span>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(cat.id, file);
                      }}
                      data-testid={`input-category-image-${cat.id}`}
                    />
                  </label>
                </div>
                <div>
                  <div className="font-black text-sm uppercase tracking-widest">{cat.name}</div>
                  <div className="text-[10px] font-bold opacity-40">{cat.slug}</div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => deleteMutation.mutate(cat.id)}
                className="hover:bg-destructive/10 hover:text-destructive rounded-none"
                data-testid={`button-delete-category-${cat.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

const OrdersTable = memo(() => {
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, shippingProvider, trackingNumber }: any) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}/status`, { status, shippingProvider, trackingNumber });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "تم تحديث حالة الطلب" });
    }
  });

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((order: any) => {
      const matchesStatus = filter === "all" || order.status === filter;
      const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (order.shippingAddress?.street?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orders, filter, searchTerm]);

  if (isLoading) return <Loader2 className="animate-spin mx-auto" />;

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'new': return <Badge className="bg-primary rounded-none">جديد</Badge>;
      case 'processing': return <Badge className="bg-blue-500 rounded-none">تجهيز</Badge>;
      case 'shipped': return <Badge className="bg-orange-500 rounded-none">تم الشحن</Badge>;
      case 'completed': return <Badge className="bg-green-600 rounded-none">مكتمل</Badge>;
      case 'cancelled': return <Badge variant="destructive" className="rounded-none">ملغي</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const exportReport = (format: 'pdf' | 'excel') => {
    toast({ title: `جاري تصدير التقرير بصيغة ${format.toUpperCase()}...` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <h2 className="text-2xl font-bold uppercase tracking-tight">إدارة الطلبات</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportReport('excel')} className="rounded-none text-xs font-bold border-black/10">
            تصدير تقرير Excel
          </Button>
          <Button variant="outline" onClick={() => exportReport('pdf')} className="rounded-none text-xs font-bold border-black/10">
            تصدير PDF
          </Button>
        </div>
      </div>

      <div className="rounded-none border border-black/5 overflow-hidden">
        <div className="p-6 grid grid-cols-7 font-black uppercase tracking-widest text-[10px] bg-secondary/20 text-black/40 border-b border-black/5">
          <div className="text-right">رقم الطلب</div>
          <div className="text-right">العميل</div>
          <div className="text-right">المبلغ</div>
          <div className="text-right">الربح</div>
          <div className="text-right">الحالة</div>
          <div className="text-right">التاريخ</div>
          <div className="text-center">إجراءات</div>
        </div>
        <div className="divide-y divide-black/5">
          {filteredOrders.map((order: any) => (
            <div key={order.id} className="p-6 grid grid-cols-7 items-center hover:bg-secondary/10 transition-colors">
              <div className="font-black">#{order.id.slice(-6).toUpperCase()}</div>
              <div className="font-bold truncate">عميل</div>
              <div className="font-black tracking-tighter">{Number(order.total).toLocaleString()} ر.س</div>
              <div className="font-black text-green-600 text-[10px]">+{Number(order.netProfit || 0).toLocaleString()} ر.س</div>
              <div>{getStatusBadge(order.status)}</div>
              <div className="text-xs text-black/40">{new Date(order.createdAt).toLocaleDateString("ar-SA")}</div>
              <div className="flex justify-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-black/5 rounded-none">
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent dir="rtl" className="rounded-none max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="text-right font-black">تحديث الطلب #{order.id.slice(-6).toUpperCase()}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 pt-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">تغيير الحالة</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {orderStatuses.map(s => (
                            <Button 
                              key={s} 
                              variant={order.status === s ? 'default' : 'outline'}
                              className="rounded-none text-[10px] h-10 font-bold"
                              onClick={() => updateStatusMutation.mutate({ id: order.id, status: s })}
                            >
                              {s === 'new' ? 'جديد' : s === 'processing' ? 'تجهيز' : s === 'shipped' ? 'شحن' : s === 'completed' ? 'مكتمل' : 'إلغاء'}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-black/5 space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">تفاصيل الشحن</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold">شركة الشحن</Label>
                            <Input 
                              placeholder="Storage Station" 
                              defaultValue={order.shippingProvider} 
                              className="rounded-none"
                              id={`provider-${order.id}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold">رقم التتبع</Label>
                            <Input 
                              placeholder="TRK123..." 
                              defaultValue={order.trackingNumber} 
                              className="rounded-none"
                              id={`tracking-${order.id}`}
                            />
                          </div>
                        </div>
                        <Button 
                          className="w-full rounded-none font-bold"
                          onClick={() => {
                            const p = (document.getElementById(`provider-${order.id}`) as HTMLInputElement).value;
                            const t = (document.getElementById(`tracking-${order.id}`) as HTMLInputElement).value;
                            updateStatusMutation.mutate({ id: order.id, status: order.status, shippingProvider: p, trackingNumber: t });
                          }}
                        >
                          تحديث معلومات الشحن
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

const ReturnsTable = memo(() => {
  const { data: orders } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders");
      return res.json();
    }
  });

  const returnOrders = useMemo(() => {
    return (orders || []).filter((o: any) => o.returnRequest && o.returnRequest.status !== 'none');
  }, [orders]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold uppercase tracking-tight">الاسترجاع والاستبدال</h2>
      <div className="rounded-none border border-black/5 overflow-hidden">
        {returnOrders.length === 0 ? (
          <div className="p-24 text-center text-black/20">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <p className="font-bold uppercase tracking-widest text-xs">لا توجد طلبات استرجاع حالياً</p>
          </div>
        ) : (
          <div className="divide-y divide-black/5">
            {returnOrders.map((order: any) => (
              <div key={order.id} className="p-6 flex justify-between items-center hover:bg-secondary/10">
                <div className="space-y-1">
                  <p className="font-black text-sm">#{order.id.slice(-6).toUpperCase()}</p>
                  <p className="text-[10px] font-bold uppercase text-black/40">{order.returnRequest.type === 'return' ? 'استرجاع' : 'استبدال'}</p>
                </div>
                <Badge variant="outline" className="rounded-none">{order.returnRequest.status}</Badge>
                <Button variant="ghost" className="rounded-none text-xs font-bold border border-black/5">إدارة الطلب</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

// ... (Rest of StatsCards, ProductsTable, CustomersTable)

// ... imports
import { Wallet, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const OrdersManagement = memo(() => {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders");
      return res.json();
    }
  });

  const { toast } = useToast();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await apiRequest("PATCH", `/api/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "تم تحديث حالة الطلب بنجاح" });
    }
  });

  if (isLoading) return <Loader2 className="animate-spin mx-auto" />;

  const filteredOrders = orders || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase tracking-tight">إدارة الطلبات</h2>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.map((order: any) => (
          <Card key={order.id} className="rounded-none border-black/5 hover-elevate overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="font-black text-sm">#{order.id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs font-bold text-black/40 uppercase">{order.customerName || "عميل زائر"}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-black text-sm">{order.total} ر.س</p>
                    <Badge variant="outline" className="rounded-none text-[8px] uppercase">{order.status}</Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border border-black/5">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-none font-bold text-xs">
                      {orderStatuses.map((status) => (
                        <DropdownMenuItem 
                          key={status} 
                          onClick={() => updateStatusMutation.mutate({ id: order.id, status })}
                          className="text-right"
                        >
                          تغيير إلى {status}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
});

const CustomersTable = memo(() => {
  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    }
  });

  const { toast } = useToast();
  const [walletAmount, setWalletAmount] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const updateWalletMutation = useMutation({
    mutationFn: async ({ id, amount, type }: { id: string, amount: string, type: 'deposit' | 'set' }) => {
      const endpoint = type === 'deposit' ? `/api/admin/users/${id}/deposit` : `/api/admin/users/${id}`;
      const payload = type === 'deposit' ? { amount: Number(amount) } : { walletBalance: amount };
      await apiRequest(type === 'deposit' ? "POST" : "PATCH", endpoint, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "تم تحديث المحفظة بنجاح" });
      setSelectedUser(null);
      setWalletAmount("");
    }
  });

  if (isLoading) return <Loader2 className="animate-spin mx-auto" />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase tracking-tight">إدارة العملاء</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users?.filter((u: any) => u.role === 'customer').map((u: any) => (
          <Card key={u.id} className="border-black/5 hover-elevate overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-black text-lg">{u.name}</p>
                  <p className="text-xs font-bold text-black/40">{u.phone || "-"}</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <Wallet className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary/10 border border-black/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-black/40">رصيد المحفظة</span>
                <span className="font-black text-green-600">{u.walletBalance} ر.س</span>
              </div>
              <div className="flex gap-2">
                <Dialog open={selectedUser?.id === u.id && selectedUser?.action === 'deposit'} onOpenChange={(open) => { if (!open) setSelectedUser(null); }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => setSelectedUser({ ...u, action: 'deposit' })} className="flex-1 rounded-none font-black text-[10px] uppercase h-8">
                      إيداع رصيد
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-none max-w-sm" dir="rtl">
                    <DialogHeader>
                      <DialogTitle>إيداع رصيد لـ {u.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase">المبلغ المراد إيداعه</Label>
                        <Input 
                          type="number" 
                          value={walletAmount} 
                          onChange={(e) => setWalletAmount(e.target.value)} 
                          placeholder="0"
                          className="rounded-none"
                        />
                      </div>
                      <Button 
                        className="w-full rounded-none font-black"
                        onClick={() => updateWalletMutation.mutate({ id: u.id, amount: walletAmount, type: 'deposit' })}
                        disabled={!walletAmount || updateWalletMutation.isPending}
                      >
                        {updateWalletMutation.isPending ? <Loader2 className="animate-spin" /> : "إيداع الآن"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={selectedUser?.id === u.id && selectedUser?.action === 'set'} onOpenChange={(open) => { if (!open) setSelectedUser(null); }}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" onClick={() => setSelectedUser({ ...u, action: 'set' })} className="flex-1 rounded-none font-black text-[10px] uppercase h-8 border border-black/5">
                      تعديل الرصيد
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-none max-w-sm" dir="rtl">
                    <DialogHeader>
                      <DialogTitle>تعديل رصيد {u.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase">الرصيد الكلي الجديد</Label>
                        <Input 
                          type="number" 
                          value={walletAmount} 
                          onChange={(e) => setWalletAmount(e.target.value)} 
                          placeholder="0"
                          className="rounded-none"
                        />
                      </div>
                      <Button 
                        className="w-full rounded-none font-black"
                        onClick={() => updateWalletMutation.mutate({ id: u.id, amount: walletAmount, type: 'set' })}
                        disabled={!walletAmount || updateWalletMutation.isPending}
                      >
                        {updateWalletMutation.isPending ? <Loader2 className="animate-spin" /> : "تحديث الرصيد"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
});

const CouponsTable = memo(() => {
  const { data: coupons, isLoading } = useQuery<any[]>({ queryKey: ["/api/coupons"] });
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  const form = useForm({
    defaultValues: {
      code: "",
      type: "percentage" as const,
      value: "0",
      usageLimit: "",
      minOrderAmount: "",
      isActive: true,
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const parsed = {
        ...data,
        value: Number(data.value),
        usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
        minOrderAmount: data.minOrderAmount ? Number(data.minOrderAmount) : undefined,
      };
      const res = await apiRequest("POST", "/api/coupons", parsed);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coupons"] });
      form.reset();
      setOpen(false);
      toast({ title: "تمت إضافة كود الخصم بنجاح" });
    },
    onError: (err: any) => {
      toast({ title: "خطأ", description: err.message || "فشلت إضافة الكود", variant: "destructive" });
    }
  });

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold uppercase tracking-tight">أكواد الخصم</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-none font-bold uppercase tracking-widest text-xs h-10 px-6">
              <Plus className="ml-2 h-4 w-4" /> إضافة كود
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-none max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة كود خصم جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">الكود</Label>
                <Input
                  {...form.register("code", { required: true })}
                  placeholder="مثال: SUMMER2026"
                  className="rounded-none uppercase"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">النوع</Label>
                  <Select value={form.watch("type")} onValueChange={(val) => form.setValue("type", val as any)}>
                    <SelectTrigger className="rounded-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">نسبة مئوية</SelectItem>
                      <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                      <SelectItem value="cashback">كاش باك</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">القيمة</Label>
                  <Input
                    type="number"
                    {...form.register("value", { required: true })}
                    placeholder="0"
                    className="rounded-none"
                  />
                </div>
              </div>
              
              {form.watch("type") === ("cashback" as any) && (
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">أقصى كاش باك (اختياري)</Label>
                  <Input
                    type="number"
                    {...form.register("maxCashback" as any)}
                    placeholder="مثال: 500"
                    className="rounded-none"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">الوصف (اختياري)</Label>
                <Input
                  {...form.register("description" as any)}
                  placeholder="مثال: احصل على 10% كاش باك"
                  className="rounded-none text-right"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">حد الاستخدام (اختياري)</Label>
                  <Input
                    type="number"
                    {...form.register("usageLimit")}
                    placeholder="غير محدود"
                    className="rounded-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">الحد الأدنى للطلب (اختياري)</Label>
                  <Input
                    type="number"
                    {...form.register("minOrderAmount")}
                    placeholder="0 ر.س"
                    className="rounded-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-none">
                <Label className="text-xs font-bold uppercase">نشط</Label>
                <Switch
                  checked={form.watch("isActive")}
                  onCheckedChange={(checked) => form.setValue("isActive", checked)}
                />
              </div>

              <Button 
                type="submit" 
                disabled={createMutation.isPending}
                className="w-full rounded-none font-bold uppercase tracking-widest"
              >
                {createMutation.isPending ? <Loader2 className="animate-spin ml-2" /> : "إضافة الكود"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-none border border-black/5 overflow-hidden bg-white">
        <div className="p-6 grid grid-cols-6 font-black uppercase tracking-widest text-[10px] bg-secondary/10 text-black/40 border-b border-black/5">
          <div className="text-right">الكود</div>
          <div className="text-right">النوع</div>
          <div className="text-right">القيمة</div>
          <div className="text-right">الحد</div>
          <div className="text-right">الاستخدام</div>
          <div className="text-right">الحالة</div>
        </div>
        <div className="divide-y divide-black/5">
          {coupons?.map(c => (
            <div key={c.id} className="p-6 grid grid-cols-6 items-center hover:bg-secondary/5 transition-colors">
              <div className="font-black text-xs tracking-widest">{c.code}</div>
              <div className="text-[8px] font-bold uppercase opacity-60">
                {c.type === 'percentage' ? 'نسبة' : c.type === 'cashback' ? 'كاش باك' : 'مبلغ ثابت'}
              </div>
              <div className="font-black text-xs">{c.value} {c.type === 'percentage' || c.type === 'cashback' ? '%' : 'ر.س'}</div>
              <div className="text-[8px] font-bold">{c.perUserLimit}x لكل مستخدم</div>
              <div className="text-[10px] font-bold">{c.usageCount} / {c.usageLimit || '∞'}</div>
              <div>
                <Badge className={c.isActive ? "bg-green-600" : "bg-destructive"}>
                  {c.isActive ? "نشط" : "معطل"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

const LogsTable = memo(() => {
  const { data: logs, isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/logs"] });

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold uppercase tracking-tight">سجل العمليات</h2>
      <div className="rounded-none border border-black/5 overflow-hidden">
        <div className="p-6 grid grid-cols-4 font-black uppercase tracking-widest text-[10px] bg-secondary/20 text-black/40 border-b border-black/5">
          <div className="text-right">الموظف</div>
          <div className="text-right">الإجراء</div>
          <div className="text-right">الهدف</div>
          <div className="text-right">التاريخ</div>
        </div>
        <div className="divide-y divide-black/5">
          {logs?.map((l: any) => (
            <div key={l.id} className="p-6 grid grid-cols-4 items-center hover:bg-secondary/10 transition-colors">
              <div className="font-bold">{l.employeeId}</div>
              <div className="text-sm">{l.action}</div>
              <div className="text-xs opacity-60">{l.targetType} {l.targetId && `(#${l.targetId.slice(-6)})`}</div>
              <div className="text-xs">{new Date(l.createdAt).toLocaleString('ar-SA')}</div>
            </div>
          ))}
          {logs?.length === 0 && (
            <div className="p-12 text-center text-black/20 font-bold uppercase tracking-widest text-[10px]">
              لا توجد سجلات حالياً
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

const EmployeesManagement = () => {
  const { toast } = useToast();
  const { data: users, isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/users"] });
  const { data: branches } = useQuery<any[]>({ queryKey: ["/api/branches"] });
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "employee",
    branchId: "main",
    loginType: "dashboard" as const,
    permissions: [] as string[]
  });

  const defaultRolePermissions: Record<string, string[]> = {
    admin: ["orders.view", "orders.edit", "orders.refund", "products.view", "products.edit", "customers.view", "wallet.adjust", "reports.view", "staff.manage", "pos.access", "settings.manage"],
    employee: ["orders.view", "products.view", "customers.view", "pos.access"],
    support: ["orders.view", "customers.view"],
    cashier: ["pos.access", "orders.view"],
    accountant: ["reports.view", "orders.view"]
  };

  const lastEditingUserIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (editingUser && editingUser.id !== lastEditingUserIdRef.current) {
      setFormData({
        name: editingUser.name || "",
        phone: editingUser.phone || "",
        email: editingUser.email || "",
        password: "",
        role: editingUser.role || "employee",
        branchId: editingUser.branchId || "main",
        loginType: editingUser.loginType || "dashboard",
        permissions: editingUser.permissions || []
      });
      lastEditingUserIdRef.current = editingUser.id;
    } else if (!editingUser) {
      lastEditingUserIdRef.current = null;
    }
  }, [editingUser]);

  useEffect(() => {
    if (!open) {
      setEditingUser(null);
      setFormData({
        name: "",
        phone: "",
        email: "",
        password: "",
        role: "employee",
        branchId: "main",
        loginType: "dashboard",
        permissions: defaultRolePermissions.employee
      });
    }
  }, [open]);

  useEffect(() => {
    if (open && !editingUser && formData.role && defaultRolePermissions[formData.role]) {
      const newPermissions = defaultRolePermissions[formData.role];
      const currentPermissionsStr = JSON.stringify(formData.permissions || []);
      const newPermissionsStr = JSON.stringify(newPermissions);
      
      if (currentPermissionsStr !== newPermissionsStr) {
        setFormData(prev => ({ ...prev, permissions: newPermissions }));
      }
    }
  }, [formData.role, editingUser, open, formData.permissions]);

  const employees = useMemo(() => 
    users?.filter(u => ["admin", "employee", "support", "cashier", "accountant"].includes(u.role)) || []
  , [users]);

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/users", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "تم إضافة الموظف بنجاح" });
      setOpen(false);
      setFormData({
        name: "",
        phone: "",
        email: "",
        password: "",
        role: "employee",
        branchId: "main",
        loginType: "dashboard",
        permissions: defaultRolePermissions.employee
      });
    },
    onError: (err: any) => {
      toast({ title: "خطأ", description: err.message || "فشلت الإضافة", variant: "destructive" });
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string, isActive: boolean }) => {
      await apiRequest("PATCH", `/api/admin/users/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "تم تحديث حالة الموظف" });
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, password }: any) => {
      await apiRequest("PATCH", `/api/admin/users/${id}/reset-password`, { password });
    },
    onSuccess: () => {
      toast({ title: "تم إعادة تعيين كلمة المرور بنجاح" });
      setResetDialogOpen(false);
      setNewPassword("");
    }
  });

  if (isLoading) return <Loader2 className="animate-spin" />;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase tracking-tight">إدارة الموظفين</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingUser(null); setOpen(true); }} className="rounded-none font-bold text-xs h-10 px-6">
              <Plus className="ml-2 h-4 w-4" /> إضافة موظف جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-none overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة موظف جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4" dir="rtl">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-right block">الاسم</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="text-right" />
                </div>
                <div className="space-y-2">
                  <Label className="text-right block">رقم الهاتف</Label>
                  <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="text-right" placeholder="5XXXXXXXX" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-right block">البريد الإلكتروني</Label>
                  <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="text-right" />
                </div>
                <div className="space-y-2">
                  <Label className="text-right block">كلمة المرور</Label>
                  <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="text-right" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-right block">الدور الوظيفي</Label>
                  <Select value={formData.role} onValueChange={v => setFormData({...formData, role: v})}>
                    <SelectTrigger className="text-right"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">مدير (Admin)</SelectItem>
                      <SelectItem value="employee">موظف (Employee)</SelectItem>
                      <SelectItem value="support">دعم فني (Support)</SelectItem>
                      <SelectItem value="cashier">كاشير (Cashier)</SelectItem>
                      <SelectItem value="accountant">محاسب (Accountant)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-right block">نوع الدخول</Label>
                  <Select value={formData.loginType} onValueChange={(v: any) => setFormData({...formData, loginType: v})}>
                    <SelectTrigger className="text-right"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">لوحة التحكم</SelectItem>
                      <SelectItem value="pos">POS فقط</SelectItem>
                      <SelectItem value="both">الاثنين</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-right block">الفرع المرتبط</Label>
                <Select value={formData.branchId} onValueChange={v => setFormData({...formData, branchId: v})}>
                  <SelectTrigger className="text-right"><SelectValue placeholder="اختر الفرع" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">المركز الرئيسي</SelectItem>
                    {branches?.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-4 border-t border-black/5 text-right">
                <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">الصلاحيات الممنوحة</Label>
                <div className="grid grid-cols-3 gap-2">
                  {employeePermissions.map(perm => (
                    <div key={perm} className="flex items-center gap-2 bg-secondary/10 p-2 border border-black/5">
                      <Switch 
                        checked={formData.permissions.includes(perm)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({ ...prev, permissions: [...prev.permissions, perm] }));
                          } else {
                            setFormData(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== perm) }));
                          }
                        }}
                      />
                      <span className="text-[9px] font-bold">
                        {perm === 'orders.view' ? 'عرض الطلبات' :
                         perm === 'orders.edit' ? 'تعديل الطلبات' :
                         perm === 'orders.refund' ? 'استرجاع الأموال' :
                         perm === 'products.view' ? 'عرض المنتجات' :
                         perm === 'products.edit' ? 'تعديل المنتجات' :
                         perm === 'customers.view' ? 'عرض العملاء' :
                         perm === 'wallet.adjust' ? 'تعديل المحفظة' :
                         perm === 'reports.view' ? 'عرض التقارير' :
                         perm === 'staff.manage' ? 'إدارة الموظفين' :
                         perm === 'pos.access' ? 'دخول POS' :
                         perm === 'settings.manage' ? 'إدارة الإعدادات' : perm}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full h-12 rounded-none font-black" 
                onClick={() => createEmployeeMutation.mutate(formData)}
                disabled={createEmployeeMutation.isPending}
              >
                {createEmployeeMutation.isPending ? <Loader2 className="animate-spin" /> : "إضافة الموظف للأنظمة"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((emp: any) => (
          <Card key={emp.id} className="border-black/5 hover-elevate overflow-hidden">
            <CardHeader className="bg-secondary/20 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-black">{emp.name}</CardTitle>
                  <p className="text-xs text-muted-foreground font-bold">{emp.role.toUpperCase()}</p>
                </div>
                <Badge variant={emp.isActive ? "default" : "destructive"}>
                  {emp.isActive ? "نشط" : "معطل"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">الهاتف</p>
                  <p className="font-bold">{emp.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">الفرع</p>
                  <p className="font-bold">{emp.branchId || "المركز الرئيسي"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">الصلاحيات</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {emp.permissions?.slice(0, 5).map((p: string) => (
                      <Badge key={p} variant="outline" className="text-[8px] rounded-none px-1 h-4">{p.split('.')[1] || p}</Badge>
                    ))}
                    {emp.permissions?.length > 5 && <span className="text-[8px] font-bold">+{emp.permissions.length - 5}</span>}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-black/5">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-[10px] font-black h-8"
                  onClick={() => {
                    toggleActiveMutation.mutate({ id: emp.id, isActive: !emp.isActive });
                  }}
                >
                  {emp.isActive ? "تعطيل" : "تفعيل"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-[10px] font-black h-8"
                  onClick={() => {
                    setEditingUser(emp);
                    setResetDialogOpen(true);
                  }}
                >
                  كلمة المرور
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="max-w-md rounded-none">
          <DialogHeader>
            <DialogTitle className="text-right">إعادة تعيين كلمة المرور</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4" dir="rtl">
            <div className="space-y-2">
              <Label className="text-right block">كلمة المرور الجديدة</Label>
              <Input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                className="text-right"
              />
            </div>
            <Button 
              className="w-full h-12 rounded-none font-black"
              onClick={() => resetPasswordMutation.mutate({ id: editingUser.id, password: newPassword })}
              disabled={!newPassword || resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? <Loader2 className="animate-spin" /> : "حفظ"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const AdminBranches = () => {
  const { data: branches, isLoading } = useQuery<any[]>({ queryKey: ["/api/branches"] });
  if (isLoading) return <Loader2 className="animate-spin mx-auto" />;
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase tracking-tight">إدارة الفروع</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches?.map(branch => (
          <Card key={branch.id} className="rounded-none border-black/5 hover-elevate">
            <CardHeader><CardTitle className="text-sm font-black uppercase">{branch.name}</CardTitle></CardHeader>
            <CardContent><p className="text-[10px] font-bold text-muted-foreground">{branch.location || "لا يوجد موقع"}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const AdminStaff = () => {
  const { data: staff, isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/staff"] });
  if (isLoading) return <Loader2 className="animate-spin mx-auto" />;
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase tracking-tight">إدارة الطاقم</h2>
      <div className="rounded-none border border-black/5 overflow-hidden bg-white shadow-sm">
        <div className="divide-y divide-black/5">
          {staff?.map(member => (
            <div key={member.id} className="p-6 flex justify-between items-center">
              <div className="font-black text-sm uppercase tracking-widest">{member.name}</div>
              <Badge variant={member.isActive ? "default" : "destructive"}>{member.role}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AdminAuditLogs = () => {
  const { data: logs, isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/audit-logs"] });
  if (isLoading) return <Loader2 className="animate-spin mx-auto" />;
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase tracking-tight">سجل العمليات</h2>
      <div className="rounded-none border border-black/5 overflow-hidden bg-white shadow-sm">
        <div className="divide-y divide-black/5">
          {logs?.map(log => (
            <div key={log.id} className="p-4 text-xs font-bold">{log.details}</div>
          ))}
        </div>
      </div>
    </div>
  );
};


const AdminBranchInventory = () => {
  return (
    <Card className="border-2 border-dashed border-black/10">
      <CardContent className="p-12 text-center">
        <Building className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p className="font-bold uppercase tracking-widest text-sm">إدارة مخزون الفروع جاهزة للاستخدام</p>
        <p className="text-xs text-muted-foreground mt-2">يمكن إضافة الميزات المتقدمة لاحقاً</p>
      </CardContent>
    </Card>
  );
};

const AdminSidebar = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) => {
  const { logout: handleLogout } = useAuth();
  const { setOpenMobile } = useSidebar();
  const [, setLocation] = useLocation();

  const logout = () => {
    handleLogout(undefined, {
      onSuccess: () => {
        setLocation("/");
      }
    });
  };

  const menuItems = [
    { id: "overview", label: "نظرة عامة", icon: BarChart3 },
    { id: "products", label: "المنتجات", icon: PackageCheck },
    { id: "inventory", label: "المخزون", icon: Package },
    { id: "pos_link", label: "نقطة البيع (POS)", icon: Monitor, url: "/pos" },
    { id: "shifts", label: "إدارة الوردية", icon: Clock },
    { id: "cash_report", label: "تقارير النقد", icon: DollarSign, url: "/cash-report" },
    { id: "orders", label: "الطلبات", icon: ShoppingCart },
    { id: "staff", label: "الموظفين", icon: UserIcon },
    { id: "branches", label: "الفروع", icon: Building },
    { id: "customers", label: "العملاء", icon: Tag },
    { id: "coupons", label: "أكواد الخصم", icon: DollarSign },
    { id: "marketing", label: "التسويق", icon: LayoutGrid },
    { id: "logs", label: "سجل العمليات", icon: History },
  ];

  return (
    <Sidebar side="right" className="border-r border-black/5">
      <SidebarContent className="bg-[#059467] flex flex-col h-full">
        <div className="flex-1">
          <div className="p-6">
            <h2 className="text-xl font-black uppercase tracking-tighter text-white">M&Z STORE</h2>
            <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-1">Control Panel</p>
          </div>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    {item.url ? (
                      <SidebarMenuButton 
                        asChild
                        className="h-12 px-6 rounded-none text-white/70 hover:text-white hover:bg-black/20 transition-all"
                      >
                        <Link href={item.url} onClick={() => setOpenMobile(false)}>
                          <item.icon className="h-4 w-4 ml-3" />
                          <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton 
                        onClick={() => {
                          onTabChange(item.id);
                          setOpenMobile(false);
                        }}
                        data-active={activeTab === item.id}
                        className="h-12 px-6 rounded-none data-[active=true]:bg-black data-[active=true]:text-white text-white/70 hover:text-white hover:bg-black/20 transition-all"
                      >
                        <item.icon className="h-4 w-4 ml-3" />
                        <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        <div className="p-4 border-t border-white/10 mt-auto">
          <Button 
            variant="ghost" 
            className="w-full h-12 px-6 rounded-none text-white/70 hover:text-white hover:bg-black/20 justify-start gap-3"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" />
            <span className="font-bold text-xs uppercase tracking-widest">تسجيل الخروج</span>
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default function Admin() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  if (authLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!user || user.role !== 'admin') { setLocation("/"); return null; }

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <Layout>
      <SidebarProvider style={sidebarStyle as React.CSSProperties}>
        <div className="flex h-screen w-full bg-secondary/5" dir="rtl">
          <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          
          <main className="flex-1 flex flex-col overflow-hidden">
            <header className="h-16 border-b border-black/5 bg-white flex items-center justify-between px-8 shrink-0">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-lg font-black uppercase tracking-tight">
                  {activeTab === "overview" && "نظرة عامة"}
                  {activeTab === "products" && "إدارة المنتجات"}
                  {activeTab === "inventory" && "جرد الفروع"}
                  {activeTab === "shifts" && "إدارة الورديات"}
                  {activeTab === "orders" && "الطلبات"}
                  {activeTab === "staff" && "إدارة الطاقم"}
                  {activeTab === "branches" && "إدارة الفروع"}
                  {activeTab === "customers" && "المستخدمين"}
                  {activeTab === "coupons" && "أكواد الخصم"}
                  {activeTab === "logs" && "سجل العمليات"}
                </h1>
              </div>
              <ThemeToggle />
            </header>

            <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
              <div className="max-w-7xl mx-auto space-y-8">
                {activeTab === "overview" && <StatsCards />}
                {activeTab === "products" && <ProductsTable />}
                {activeTab === "inventory" && <AdminBranchInventory />}
                {activeTab === "orders" && <OrdersManagement />}
                {activeTab === "staff" && <AdminStaff />}
                {activeTab === "branches" && <AdminBranches />}
                {activeTab === "shifts" && <ShiftsManagement />}
                {activeTab === "customers" && <CustomersTable />}
                {activeTab === "coupons" && <CouponsTable />}
                {activeTab === "marketing" && <MarketingManagement />}
                {activeTab === "logs" && <AdminAuditLogs />}
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </Layout>
  );
}

const ShiftsManagement = () => {
  const [, setLocation] = useLocation();
  const { data: shifts, isLoading } = useQuery<any[]>({ 
    queryKey: ["/api/cash-shifts"] 
  });

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  const activeShift = shifts?.find(s => s.status === "open");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-black uppercase">إدارة الورديات اليومية</h3>
        <Button onClick={() => setLocation("/cash-drawer")} className="gap-2">
          <Clock className="h-4 w-4" />
          فتح صندوق النقد
        </Button>
      </div>
      
      {activeShift && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <p className="text-sm font-bold text-green-700">وردية مفتوحة حالياً: {activeShift.openingBalance?.toFixed(2)} ر.س</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {shifts?.filter(s => s.status === "closed").map((shift) => (
          <Card key={shift.id} className="rounded-none border-black/5">
            <CardContent className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-4 text-right">
                <div className="w-10 h-10 bg-black/5 flex items-center justify-center">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-black text-xs uppercase">وردية #{shift.id.slice(-4).toUpperCase()}</p>
                  <p className="text-[10px] font-bold text-muted-foreground">
                    {new Date(shift.closedAt).toLocaleString('ar-SA')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-black/40">الرصيد الافتتاحي</p>
                  <p className="text-sm font-bold">{shift.openingBalance?.toFixed(2)} ر.س</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-black/40">الفرق</p>
                  <p className={`text-sm font-bold ${(shift.difference || 0) === 0 ? "text-green-600" : (shift.difference || 0) > 0 ? "text-blue-600" : "text-red-600"}`}>
                    {(shift.difference || 0).toFixed(2)} ر.س
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!shifts || shifts.filter(s => s.status === "closed").length === 0) && !activeShift && (
          <div className="text-center py-12 text-muted-foreground text-xs font-bold uppercase tracking-widest">
            لا توجد ورديات مسجلة
          </div>
        )}
      </div>
    </div>
  );
};

const MarketingManagement = () => {
  const { toast } = useToast();
  const { data: marketing, isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/marketing"] });
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    image: "",
    link: "",
    type: "banner" as const,
    isActive: true
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formDataToSend = new FormData();
    formDataToSend.append("file", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataToSend,
        credentials: "include"
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setFormData(prev => ({ ...prev, image: data.url }));
      toast({ title: "تم رفع الصورة" });
    } catch (err) {
      console.error("Upload error:", err);
      toast({ variant: "destructive", title: "فشل الرفع" });
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!data.title || !data.image) {
        throw new Error("العنوان والصورة مطلوبة");
      }
      await apiRequest("POST", "/api/admin/marketing", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing"] });
      toast({ title: "تمت إضافة العنصر التسويقي بنجاح" });
      setFormData({ title: "", image: "", link: "", type: "banner", isActive: true });
      setOpen(false);
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: err.message || "فشل حفظ العنصر" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/marketing/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing"] });
      toast({ title: "تم حذف العنصر بنجاح" });
    }
  });

  if (isLoading) return <Loader2 className="animate-spin mx-auto" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase tracking-tight">إدارة التسويق</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-none font-bold text-xs h-10 px-6">
              <Plus className="ml-2 h-4 w-4" /> إضافة بانر / بوب أب
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-none">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة عنصر تسويقي</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4" dir="rtl">
              <div className="space-y-2">
                <Label className="text-right block">العنوان</Label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="text-right" />
              </div>
              <div className="space-y-2">
                <Label className="text-right block">الصورة</Label>
                <div className="flex gap-2">
                  <Input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="text-right" placeholder="رابط الصورة" />
                  <div className="relative">
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-none shrink-0" asChild>
                      <label className="cursor-pointer">
                        <Plus className="h-4 w-4" />
                        <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                      </label>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-right block">رابط التوجيه (اختياري)</Label>
                <Input value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="text-right" />
              </div>
              <div className="space-y-2">
                <Label className="text-right block">النوع</Label>
                <Select value={formData.type} onValueChange={(v: any) => setFormData({...formData, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">بانر</SelectItem>
                    <SelectItem value="popup">بوب أب (نافذة منبثقة)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full h-12 rounded-none font-black" 
                onClick={() => createMutation.mutate(formData)}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? <Loader2 className="animate-spin" /> : "حفظ"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {marketing?.map((item: any) => (
          <Card key={item.id} className="border-black/5 hover-elevate overflow-hidden">
            <div className="aspect-video relative overflow-hidden">
              <img src={item.image} alt={item.title} className="object-cover w-full h-full" />
              <div className="absolute top-2 right-2 flex gap-2">
                <Badge variant="default" className="rounded-none font-bold uppercase tracking-widest text-[8px]">
                  {item.type === 'banner' ? 'بانر' : 'بوب أب'}
                </Badge>
                <Button 
                  size="icon" 
                  variant="destructive" 
                  className="h-8 w-8 rounded-none"
                  onClick={() => deleteMutation.mutate(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-black">{item.title}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

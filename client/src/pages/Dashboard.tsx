import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useMyOrders } from "@/hooks/use-orders";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Loader2, ShoppingBag, User, Wallet, LogOut, MapPin, 
  FileText, Package, Plus, Trash2, Home, Settings, 
  Users, BarChart3, Box, Bell, Search, Globe, ChevronRight, DollarSign
} from "lucide-react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/sidebar";

export default function Dashboard() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { data: orders, isLoading: ordersLoading } = useMyOrders();
  const { data: transactions } = useQuery({
    queryKey: ["/api/wallet/transactions"],
    enabled: !!user,
  });
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ name: "", city: "", street: "" });

  const addressMutation = useMutation({
    mutationFn: async (addresses: any[]) => {
      const res = await apiRequest("PATCH", "/api/user/addresses", { addresses });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "تم تحديث العناوين بنجاح" });
      setIsAddingAddress(false);
      setNewAddress({ name: "", city: "", street: "" });
    },
  });

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  const sidebarItems = [
    { title: "الرئيسية", icon: Home, url: "/dashboard", active: true },
    { title: "الطلبات", icon: ShoppingBag, url: "/orders" },
    { title: "صندوق النقد", icon: DollarSign, url: "/cash-drawer", shouldShow: user?.loginType === "pos" || user?.loginType === "both" },
    { title: "المنتجات", icon: Box, url: "/products" },
    { title: "الموظفين", icon: Users, url: "/employees" },
    { title: "العملاء", icon: User, url: "#" },
    { title: "التقارير", icon: BarChart3, url: "#" },
  ];

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const handleAddAddress = () => {
    const addresses = [...(user.addresses || []), { ...newAddress, id: Math.random().toString(36).substr(2, 9), isDefault: (user.addresses || []).length === 0 }];
    addressMutation.mutate(addresses);
  };

  const handleDeleteAddress = (id: string) => {
    const addresses = (user.addresses || []).filter((a: any) => a.id !== id);
    addressMutation.mutate(addresses);
  };

  return (
    <SidebarProvider style={{ "--sidebar-width": "18rem" } as React.CSSProperties}>
      <div className="flex h-screen w-full bg-[#f8fafc]" dir="rtl">
        <Sidebar className="border-l bg-white shadow-sm">
          <SidebarHeader className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-sm">متجر Gen M & Z</h2>
                <p className="text-[10px] text-muted-foreground">salla.sa/genmz</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarMenu>
                {sidebarItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={`h-12 rounded-xl mb-1 px-4 ${item.active ? 'bg-primary/5 text-primary' : 'hover:bg-muted text-muted-foreground'}`}
                    >
                      <a href={item.url} className="flex items-center gap-4">
                        <item.icon className={`w-5 h-5 ${item.active ? 'text-primary' : ''}`} />
                        <span className="font-medium text-sm">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
            
            <div className="mt-auto pt-8 border-t">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton className="h-12 rounded-xl text-muted-foreground hover:bg-muted">
                    <Settings className="w-5 h-5 ml-4" />
                    <span className="font-medium text-sm">إعدادات المتجر</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={handleLogout} 
                    className="h-12 rounded-xl text-destructive hover:bg-destructive/5"
                  >
                    <LogOut className="w-5 h-5 ml-4" />
                    <span className="font-medium text-sm">تسجيل الخروج</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <header className="h-16 bg-white border-b px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-4 w-1/3">
              <div className="relative w-full max-w-sm">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="ابحث عن طلب، عميل..." 
                  className="bg-muted/50 border-none h-10 pr-10 rounded-full text-sm"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                المتجر يعمل
              </div>
              <Button size="icon" variant="ghost" className="relative text-muted-foreground">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white" />
              </Button>
              <div className="flex items-center gap-3 border-r pr-6">
                <div className="text-left text-xs">
                  <p className="font-bold text-right">{user.name}</p>
                  <p className="text-muted-foreground">مدير المتجر</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {user.name.charAt(0)}
                </div>
              </div>
            </div>
          </header>

          <div className="p-10 space-y-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black mb-1">مرحباً بك مجدداً، {user.name.split(' ')[0]} 👋</h1>
                <p className="text-muted-foreground text-sm">هذا ما حدث في متجرك اليوم</p>
              </div>
              <Button className="rounded-xl h-12 px-6 gap-2 shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" />
                منتج جديد
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "المبيعات", value: "0", sub: "0% من الشهر الماضي", icon: BarChart3, color: "bg-blue-500" },
                { title: "الطلبات", value: orders?.length || 0, sub: "0% من الشهر الماضي", icon: ShoppingBag, color: "bg-orange-500" },
                { title: "العملاء", value: "0", sub: "0 عميل جديد", icon: Users, color: "bg-purple-500" },
                { title: "المحفظة", value: user.walletBalance, sub: "رصيد متاح", icon: Wallet, color: "bg-emerald-500" },
              ].map((stat, i) => (
                <Card key={i} className="border-none shadow-sm rounded-2xl overflow-hidden hover-elevate transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-2.5 rounded-xl ${stat.color} text-white`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-full uppercase">اليوم</span>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm mb-1">{stat.title}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-black tracking-tighter">{stat.value}</p>
                        {i === 3 && <span className="text-xs font-bold text-muted-foreground">ر.س</span>}
                      </div>
                      <p className="text-[10px] mt-2 font-medium text-muted-foreground flex items-center gap-1">
                        {stat.sub}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 border-none shadow-sm rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between p-8 border-b">
                  <CardTitle className="text-lg font-bold">أحدث الطلبات</CardTitle>
                  <Button variant="ghost" size="sm" className="text-primary gap-1 font-bold">
                    عرض الكل <ChevronRight className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {ordersLoading ? (
                    <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-muted-foreground" /></div>
                  ) : !orders?.length ? (
                    <div className="p-20 text-center space-y-4">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <ShoppingBag className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                      <p className="text-muted-foreground font-medium">لا توجد طلبات بعد</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {orders.slice(0, 5).map((order: any) => (
                        <div key={order.id} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                              <Package className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-bold text-sm">#{order.id.slice(-8).toUpperCase()}</p>
                              <p className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("ar-SA")}</p>
                            </div>
                          </div>
                          <div className="text-center">
                            <Badge variant="outline" className="rounded-full px-3 border-emerald-100 text-emerald-600 bg-emerald-50 font-bold text-[10px]">{order.status}</Badge>
                          </div>
                          <div className="text-left">
                            <p className="font-black text-sm">{order.total} ر.س</p>
                            <p className="text-[10px] text-muted-foreground">{order.paymentMethod}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-2xl">
                <CardHeader className="p-8 border-b">
                  <CardTitle className="text-lg font-bold">رصيد المحفظة</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="bg-primary rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-primary/20 mb-8">
                    <div className="relative z-10">
                      <p className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-2">الرصيد المتاح</p>
                      <p className="text-4xl font-black tracking-tighter mb-6">{user.walletBalance} <span className="text-lg font-light opacity-60">ر.س</span></p>
                      <Button className="w-full bg-white text-primary hover:bg-white/90 rounded-xl font-bold h-12">سحب الرصيد</Button>
                    </div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
                  </div>

                  <div className="space-y-6">
                    <p className="font-bold text-xs text-muted-foreground border-b pb-4">العمليات الأخيرة</p>
                    {Array.isArray(transactions) && transactions.length > 0 ? (
                      <div className="space-y-4">
                        {transactions.slice(0, 3).map((t: any) => (
                          <div key={t.id} className="flex justify-between items-center group">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${t.amount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                <Wallet className="w-4 h-4" />
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-[11px] group-hover:text-primary transition-colors">{t.description}</p>
                                <p className="text-[9px] text-muted-foreground">{new Date(t.createdAt).toLocaleDateString("ar-SA")}</p>
                              </div>
                            </div>
                            <span className={`font-black text-xs ${t.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {t.amount > 0 ? '+' : ''}{t.amount} ر.س
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-xs text-muted-foreground py-8 italic">لا توجد عمليات مؤخراً</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { Link, useSearch } from "wouter";
import { useEffect } from "react";
import { useCart } from "@/hooks/use-cart";

export default function CheckoutSuccess() {
  const { clearCart } = useCart();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const orderId = params.get("orderId");

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-green-50 p-6 rounded-full mb-6">
          <CheckCircle2 className="w-16 h-16 text-green-600" />
        </div>
        <h1 className="text-3xl font-black mb-4">تم استلام طلبك بنجاح!</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          شكرًا لشرائك من متجرنا. رقم طلبك هو <span className="font-bold text-black">#{orderId?.slice(-6).toUpperCase()}</span>.
          لقد تم إرسال تفاصيل الطلب إلى بريدك الإلكتروني.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/orders">
            <Button size="lg" className="min-w-[200px]">
              متابعة طلباتي
            </Button>
          </Link>
          <Link href="/shop">
            <Button variant="outline" size="lg" className="min-w-[200px]">
              <ShoppingBag className="w-4 h-4 ml-2" />
              العودة للمتجر
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}

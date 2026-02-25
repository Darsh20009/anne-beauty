import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { XCircle, AlertCircle } from "lucide-react";
import { Link, useSearch } from "wouter";

export default function CheckoutFailure() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const reason = params.get("reason");

  return (
    <Layout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-red-50 p-6 rounded-full mb-6">
          <XCircle className="w-16 h-16 text-red-600" />
        </div>
        <h1 className="text-3xl font-black mb-4">عذراً، فشلت عملية الدفع</h1>
        <div className="bg-red-50 border border-red-100 p-4 rounded-lg mb-8 max-w-md flex items-center gap-3 text-red-800">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm text-right">
            {reason === "declined" ? "تم رفض العملية من قبل البنك المصدر للبطاقة." : 
             reason === "expired" ? "انتهت صلاحية جلسة الدفع، يرجى المحاولة مرة أخرى." :
             "حدث خطأ غير متوقع أثناء معالجة الدفع. يرجى التأكد من بيانات البطاقة أو المحاولة لاحقاً."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/checkout">
            <Button size="lg" className="min-w-[200px]">
              المحاولة مرة أخرى
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="outline" size="lg" className="min-w-[200px]">
              العودة لحقيبة التسوق
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const branchFilter = branchId ? { branchId } : {};

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sales = await prisma.sale.findMany({
      where: {
        ...branchFilter,
        createdAt: { gte: thirtyDaysAgo },
        status: "POSTED"
      },
      include: {
        seller: true,
        items: { include: { sku: { include: { product: { include: { category: true } } } } } }
      }
    });

    // 1. Sales Trend (Chart Data)
    const salesByDate: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      salesByDate[d.toISOString().split('T')[0]] = 0;
    }

    sales.forEach((sale: any) => {
      const dateStr = sale.createdAt.toISOString().split('T')[0];
      if (salesByDate[dateStr] !== undefined) {
        salesByDate[dateStr] += sale.totalAmount;
      }
    });

    const trend = Object.entries(salesByDate).map(([date, total]) => ({ date, total }));

    // 2. Top Categories
    const catSales: Record<string, number> = {};
    sales.forEach((sale: any) => {
      sale.items.forEach((item: any) => {
        const catName = item.sku.product?.category?.name || "Kategoriyasiz";
        catSales[catName] = (catSales[catName] || 0) + (item.price * item.quantity);
      });
    });
    
    const categories = Object.entries(catSales)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // 3. Top Cashiers
    const cashierSales: Record<string, number> = {};
    sales.forEach((sale: any) => {
      const name = sale.seller ? `${sale.seller.firstName} ${sale.seller.lastName}` : "Noma'lum";
      cashierSales[name] = (cashierSales[name] || 0) + sale.totalAmount;
    });

    const cashiers = Object.entries(cashierSales)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);

    return NextResponse.json({
      trend,
      categories,
      cashiers,
      totalSales30d: sales.reduce((sum: number, s: any) => sum + s.totalAmount, 0)
    });

  } catch (error) {
    console.error("Reports error:", error);
    return NextResponse.json({ error: "Xatolik" }, { status: 500 });
  }
}

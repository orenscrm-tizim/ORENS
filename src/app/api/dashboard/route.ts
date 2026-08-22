import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const branchFilter = branchId ? { branchId } : {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Bugungi savdolar
    const todaySales = await prisma.sale.findMany({
      where: {
        ...branchFilter,
        createdAt: { gte: today },
        status: "POSTED"
      }
    });

    const todayTotal = todaySales.reduce((sum: number, s: any) => sum + s.totalAmount, 0);
    const todayCount = todaySales.length;

    // Kechagi savdolar
    const yesterdaySales = await prisma.sale.findMany({
      where: {
        ...branchFilter,
        createdAt: { gte: yesterday, lt: today },
        status: "POSTED"
      }
    });

    const yesterdayTotal = yesterdaySales.reduce((sum: number, s: any) => sum + s.totalAmount, 0);

    const change = yesterdayTotal === 0 
      ? 100 
      : ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100;

    // So'nggi harakatlar (Recent sales)
    const recentSales = await prisma.sale.findMany({
      take: 5,
      where: branchFilter,
      orderBy: { createdAt: 'desc' },
      include: { seller: true }
    });

    // Top mahsulotlar
    const branchSales = await prisma.sale.findMany({
      where: branchFilter,
      select: { id: true }
    });
    const saleIds = branchSales.map((s: any) => s.id);

    const topItems = await prisma.saleItem.groupBy({
      by: ['skuId'],
      where: { saleId: { in: saleIds } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 4
    });

    const topSkus = await prisma.sku.findMany({
      where: { id: { in: topItems.map((i: any) => i.skuId) } },
      include: { product: true }
    });

    const topProducts = topItems.map((item: any) => {
      const sku = topSkus.find((s: any) => s.id === item.skuId);
      return {
        name: sku ? `${sku.product.name} ${sku.name !== sku.product.name ? `(${sku.name})` : ''}` : 'Noma\'lum',
        sales: item._sum.quantity || 0,
        percent: 0 // Will calculate in UI relative to max
      };
    });

    return NextResponse.json({
      todayTotal,
      yesterdayTotal,
      todayCount,
      change: change.toFixed(1),
      isUp: change >= 0,
      recentSales,
      topProducts
    });

  } catch (error) {
    return NextResponse.json({ error: "Xatolik" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const stocks = await prisma.stock.findMany({
      include: {
        sku: { include: { product: { include: { category: true, brand: true } } } },
        branch: true
      },
      orderBy: { quantity: 'asc' }
    });
    
    // As in POS, we might want to also return SKUs that don't have stock records yet 
    // so they can be received. Let's just return all SKUs with their stock (or 0).
    const skus = await prisma.sku.findMany({
      include: {
        product: { include: { category: true, brand: true } },
        stocks: true
      }
    });

    return NextResponse.json(skus);
  } catch (error) {
    return NextResponse.json({ error: "Xatolik" }, { status: 500 });
  }
}

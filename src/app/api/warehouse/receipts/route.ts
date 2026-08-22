import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { items, supplierId } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Bo'sh ro'yxat" }, { status: 400 });
    }

    let branchId = session?.user?.branchId;
    if (!branchId) {
      const branch = await prisma.branch.findFirst();
      if (!branch) return NextResponse.json({ error: "Filial topilmadi" }, { status: 400 });
      branchId = branch.id;
    }

    const totalValue = items.reduce((sum: number, item: any) => sum + (item.quantity * item.costPrice), 0);
    const docNumber = `RC-${Date.now()}`;

    // Create receipt and its items
    const receipt = await prisma.receipt.create({
      data: {
        branchId,
        supplierId,
        docNumber,
        status: "POSTED",
        totalValue,
        items: {
          create: items.map((item: any) => ({
            skuId: item.skuId,
            quantity: item.quantity,
            costPrice: item.costPrice,
          }))
        }
      },
      include: { items: true }
    });

    // Update Stock and create StockMovements
    for (const item of items) {
      // Find or create Stock
      const stock = await prisma.stock.upsert({
        where: { branchId_skuId: { branchId, skuId: item.skuId } },
        update: {
          quantity: { increment: item.quantity },
          avgCost: item.costPrice, // Simplistic avg cost
          lastReceiptAt: new Date(),
        },
        create: {
          branchId,
          skuId: item.skuId,
          quantity: item.quantity,
          avgCost: item.costPrice,
          lastReceiptAt: new Date(),
        }
      });

      // StockMovement
      await prisma.stockMovement.create({
        data: {
          skuId: item.skuId,
          branchId,
          type: "RECEIPT",
          oldQty: stock.quantity - item.quantity,
          changeQty: item.quantity,
          newQty: stock.quantity,
          sourceId: receipt.id,
          userId: session?.user?.id
        }
      });
    }

    return NextResponse.json({ success: true, receipt });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

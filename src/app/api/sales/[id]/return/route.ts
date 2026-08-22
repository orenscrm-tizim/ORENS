import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function POST(request: Request, context: any) {
  const params = await context.params;
  const id = params.id;

  try {
    const session = await getServerSession(authOptions);
    if (!session || !["OWNER", "ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Qaytarish uchun ruxsat yetarli emas" }, { status: 403 });
    }

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: { items: true, payments: true }
    });

    if (!sale) {
      return NextResponse.json({ error: "Sotuv topilmadi" }, { status: 404 });
    }

    if (sale.status === "RETURNED") {
      return NextResponse.json({ error: "Bu savdo allaqachon qaytarilgan" }, { status: 400 });
    }

    // 1. O'zgarishlar (transaction)
    await prisma.$transaction(async (tx: any) => {
      // Sotuv statusini RETURNED ga o'zgartirish
      await tx.sale.update({
        where: { id },
        data: { status: "RETURNED" }
      });

      // Tovarlarni skladga qaytarish va StockMovement yozish
      for (const item of sale.items) {
        const stock = await tx.stock.findUnique({
          where: {
            branchId_skuId: {
              branchId: sale.branchId,
              skuId: item.skuId
            }
          }
        });

        const oldQty = stock?.quantity || 0;
        const newQty = oldQty + item.quantity;

        if (stock) {
          await tx.stock.update({
            where: { id: stock.id },
            data: { quantity: newQty }
          });
        } else {
          await tx.stock.create({
            data: {
              branchId: sale.branchId,
              skuId: item.skuId,
              quantity: newQty
            }
          });
        }

        await tx.stockMovement.create({
          data: {
            skuId: item.skuId,
            branchId: sale.branchId,
            type: "REFUND",
            oldQty,
            changeQty: item.quantity,
            newQty,
            sourceId: sale.id,
            userId: session.user.id
          }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Sale RETURN error:", error);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

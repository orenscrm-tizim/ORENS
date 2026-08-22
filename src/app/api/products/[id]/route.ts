import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    
    // Check if there are stocks or sales tied to this product's SKUs
    // If so, we shouldn't hard delete, maybe just soft delete (status=INACTIVE).
    // But since schema doesn't have status on Product, we'll try hard delete for now.
    
    // First, delete related SKUs (which might cascade or fail if there are stocks/sales)
    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    // If it fails due to foreign key constraints, we return a friendly error.
    if (error.code === 'P2003') {
      return NextResponse.json({ error: "Bu mahsulot allaqachon savdoda yoki skladda bor. Uni o'chirib bo'lmaydi." }, { status: 400 });
    }
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

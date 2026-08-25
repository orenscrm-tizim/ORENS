import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    
    // Check if product is in any stocks or sales tied to this product's SKUs
    // If so, we shouldn't hard delete, maybe just soft delete (status=INACTIVE).
    // But since schema doesn't have status on Product, we'll try hard delete for now.
    
    // First, delete related SKUs (which might cascade or fail if there are stocks/sales)
    await prisma.sku.deleteMany({
      where: { productId: id }
    });

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
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { skus: true, category: true, brand: true }
    });
    if (!product) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        categoryId: body.categoryId || null,
        brandId: body.brandId || null,
      }
    });

    if (body.skus && body.skus.length > 0) {
      const skuData = body.skus[0];
      if (skuData.id) {
        await prisma.sku.update({
          where: { id: skuData.id },
          data: {
            name: skuData.name,
            barcode: skuData.barcode,
            sellPrice: skuData.sellPrice,
            costPrice: skuData.costPrice,
          }
        });
      }
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        brand: true,
        skus: true,
      }
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Xatolik" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Create product and its default SKU in one transaction
    const product = await prisma.product.create({
      data: {
        name: body.name,
        categoryId: body.categoryId,
        brandId: body.brandId,
        description: body.description,
        mxik: body.mxik,
        skus: {
          create: body.skus || [{
            name: body.name,
            sellPrice: body.sellPrice || 0,
            costPrice: body.costPrice || 0,
            barcode: body.barcode
          }]
        }
      },
      include: {
        skus: true
      }
    });
    
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Xatolik" }, { status: 500 });
  }
}

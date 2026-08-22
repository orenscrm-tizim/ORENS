import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const branchFilter = branchId ? { branchId } : {};

    const sales = await prisma.sale.findMany({
      where: branchFilter,
      include: {
        seller: { select: { firstName: true, lastName: true } },
        items: { include: { sku: true } },
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(sales);
  } catch (error) {
    return NextResponse.json({ error: "Xatolik" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { items, totalAmount, paidAmount, discount = 0, paymentMethod = 'CASH', branchId: payloadBranchId, payments } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Bo'sh savat" }, { status: 400 });
    }

    let branchId = payloadBranchId || session?.user?.branchId;
    if (!branchId) {
      let branch = await prisma.branch.findFirst();
      if (!branch) {
        let org = await prisma.organization.findFirst();
        if (!org) {
          org = await prisma.organization.create({
            data: { name: "Bosh Tashkilot" }
          });
        }
        branch = await prisma.branch.create({
          data: { name: "Asosiy Filial", organizationId: org.id }
        });
      }
      branchId = branch.id;
    }

    // Create or find shift
    let shift = await prisma.shift.findFirst({
      where: { branchId, status: "OPEN", cashierId: session?.user?.id || undefined }
    });
    
    if (!shift) {
      shift = await prisma.shift.create({
        data: {
          branchId,
          cashierId: session?.user?.id || (await prisma.user.findFirst())?.id as string,
          status: "OPEN"
        }
      });
    }

    // Har bir sale uchun unikal receiptNo
    const receiptNo = `REC-${Date.now()}`;

    const paymentData = payments ? payments.map((p: any) => ({
      amount: p.amount,
      method: p.method,
      baseAmount: p.amount
    })) : [{
      amount: paidAmount,
      method: paymentMethod,
      baseAmount: paidAmount
    }];

    const actualPaidAmount = payments ? payments.reduce((sum: number, p: any) => sum + p.amount, 0) : paidAmount;

    // Sale yaratish (transaction)
    const sale = await prisma.sale.create({
      data: {
        receiptNo,
        totalAmount,
        paidAmount: actualPaidAmount,
        discount,
        status: "POSTED",
        branchId,
        sellerId: session?.user?.id,
        shiftId: shift.id,
        items: {
          create: items.map((item: any) => ({
            skuId: item.skuId,
            quantity: item.quantity,
            price: item.price,
            costAtSale: item.costPrice || 0,
            subtotal: item.quantity * item.price,
          }))
        },
        payments: {
          create: paymentData
        }
      }
    });

    return NextResponse.json({ success: true, sale });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

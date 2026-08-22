import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const branchFilter = branchId ? { branchId } : {};

    const accounts = await prisma.moneyAccount.findMany({
      where: branchFilter
    });
    return NextResponse.json(accounts);
  } catch (error) {
    return NextResponse.json({ error: "Xatolik" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { branchId } = body;

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

    const account = await prisma.moneyAccount.create({
      data: {
        name: body.name,
        currency: body.currency || "UZS",
        balance: body.balance || 0,
        branchId: branchId
      }
    });
    return NextResponse.json(account);
  } catch (error) {
    return NextResponse.json({ error: "Xatolik" }, { status: 500 });
  }
}

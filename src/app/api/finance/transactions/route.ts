import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { accountId, amount, type, description } = body;

    // Type must be INCOME or EXPENSE
    if (!accountId || !amount || !type) {
      return NextResponse.json({ error: "Ma'lumotlar to'liq emas" }, { status: 400 });
    }

    const account = await prisma.moneyAccount.findUnique({ where: { id: accountId } });
    if (!account) return NextResponse.json({ error: "Kassa topilmadi" }, { status: 404 });

    const newBalance = type === "INCOME" ? account.balance + amount : account.balance - amount;

    // Ideally, we'd wrap this in a transaction and create a Transaction record.
    // However, our schema does not have a "Transaction" model, only MoneyAccount.
    // So we will just update the MoneyAccount balance.
    const updated = await prisma.moneyAccount.update({
      where: { id: accountId },
      data: { balance: newBalance }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Xatolik" }, { status: 500 });
  }
}

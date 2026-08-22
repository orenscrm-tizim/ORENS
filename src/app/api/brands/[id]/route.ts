import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(request: Request, context: any) {
  const params = await context.params;
  try {
    const id = params.id;
    await prisma.brand.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2003') {
      return NextResponse.json({ error: "Ushbu brendga tegishli mahsulotlar mavjud. Avval ularni o'chiring." }, { status: 400 });
    }
    return NextResponse.json({ error: "Xatolik" }, { status: 500 });
  }
}

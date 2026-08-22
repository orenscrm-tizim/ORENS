import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2003') {
      return NextResponse.json({ error: "Ushbu toifaga tegishli mahsulotlar mavjud. Avval mahsulotlarni o'chiring." }, { status: 400 });
    }
    return NextResponse.json({ error: "Xatolik" }, { status: 500 });
  }
}

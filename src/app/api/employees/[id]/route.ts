import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    // We shouldn't physically delete users who have made sales because it will break relation.
    // However, Prisma might cascade or fail. Let's try to delete.
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2003') {
      return NextResponse.json({ error: "Ushbu xodim allaqachon savdo qilgan yoki kassa operatsiyalariga bog'langan. O'chirib bo'lmaydi." }, { status: 400 });
    }
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

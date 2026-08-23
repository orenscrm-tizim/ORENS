import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tmagansiz" }, { status: 401 });
    }

    const { id } = params;

    const message = await prisma.message.findUnique({
      where: { id }
    });

    if (!message) {
      return NextResponse.json({ error: "Xabar topilmadi" }, { status: 404 });
    }

    // Faqat o'zining xabarini yoki ADMIN/OWNER bo'lsa o'chira oladi
    if (message.senderId !== session.user.id && !['OWNER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: "Bunga huquqingiz yo'q" }, { status: 403 });
    }

    await prisma.message.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

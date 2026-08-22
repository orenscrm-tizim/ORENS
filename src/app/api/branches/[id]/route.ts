import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Faqat Owner o'chira oladi" }, { status: 403 });
    }

    // Check if there are sales or shifts connected
    const shiftCount = await prisma.shift.count({ where: { branchId: id } });
    if (shiftCount > 0) {
      return NextResponse.json({ error: "Ushbu filialda savdolar mavjud. O'chirib bo'lmaydi." }, { status: 400 });
    }

    await prisma.branch.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Branch DELETE error:", error);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

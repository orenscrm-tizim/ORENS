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

    // Check if there are branches connected
    const branchCount = await prisma.branch.count({ where: { organizationId: id } });
    if (branchCount > 0) {
      return NextResponse.json({ error: "Bu tashkilotga tegishli filiallar mavjud. Avval ularni o'chiring." }, { status: 400 });
    }

    await prisma.organization.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Org DELETE error:", error);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

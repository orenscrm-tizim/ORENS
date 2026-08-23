import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const branchFilter = branchId ? { branchId } : {};

    const messages = await prisma.message.findMany({
      where: branchFilter,
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: true } }
      },
      orderBy: { createdAt: 'asc' },
      take: 100 // Load last 100 messages
    });
    
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: "Xatolik" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tmagansiz" }, { status: 401 });
    }

    const body = await request.json();
    const { text, branchId } = body;

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: "Xabar bo'sh bo'lishi mumkin emas" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        text: text.trim(),
        senderId: session.user.id,
        branchId: branchId || session.user.branchId || null
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: true } }
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

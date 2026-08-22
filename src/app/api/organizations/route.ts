import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== "OWNER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const orgs = await prisma.organization.findMany({
      include: {
        branches: true
      }
    });
    return NextResponse.json(orgs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Faqat Owner tashkilot qo'sha oladi" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const org = await prisma.organization.create({
      data: {
        name: body.name,
        address: body.address,
        phone: body.phone,
        stir: body.stir,
      }
    });
    return NextResponse.json(org);
  } catch (error) {
    return NextResponse.json({ error: "Tashkilot yaratishda xatolik yuz berdi" }, { status: 500 });
  }
}

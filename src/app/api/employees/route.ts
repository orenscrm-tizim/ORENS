import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    const employees = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        branch: { select: { id: true, name: true } },
      }
    });
    return NextResponse.json(employees);
  } catch (error) {
    return NextResponse.json({ error: "Xatolik" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const existing = await prisma.user.findUnique({ where: { phone: body.phone } });
    if (existing) {
      return NextResponse.json({ error: "Bu raqam bant" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    
    const employee = await prisma.user.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        passwordHash,
        role: body.role,
        status: "ACTIVE",
        branchId: body.branchId || null
      }
    });

    return NextResponse.json({ success: true, user: { id: employee.id } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

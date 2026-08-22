import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !["OWNER", "ADMIN", "ACCOUNTANT", "WAREHOUSE"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('orgId');

  try {
    let branches = await prisma.branch.findMany({
      where: orgId ? { organizationId: orgId } : undefined,
      include: {
        organization: true
      }
    });

    if (branches.length === 0) {
      let org = await prisma.organization.findFirst();
      if (!org) {
        org = await prisma.organization.create({ data: { name: "Asosiy Tashkilot" } });
      }
      const newBranch = await prisma.branch.create({
        data: { name: "Asosiy Filial", organizationId: org.id },
        include: { organization: true }
      });
      branches = [newBranch];
    }

    return NextResponse.json(branches);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Faqat Owner filial qo'sha oladi" }, { status: 403 });
  }

  try {
    const body = await request.json();
    
    // Auto-create an organization if it doesn't exist, just for fallback
    let orgId = body.organizationId;
    if (!orgId) {
       const org = await prisma.organization.findFirst();
       if (org) orgId = org.id;
       else {
         const newOrg = await prisma.organization.create({ data: { name: "Asosiy Tashkilot" }});
         orgId = newOrg.id;
       }
    }

    const branch = await prisma.branch.create({
      data: {
        name: body.name,
        address: body.address,
        organizationId: orgId,
      }
    });
    return NextResponse.json(branch);
  } catch (error) {
    return NextResponse.json({ error: "Filial yaratishda xatolik yuz berdi" }, { status: 500 });
  }
}

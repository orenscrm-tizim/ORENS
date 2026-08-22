import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { BranchProvider } from "@/components/BranchContext";
import AppLayout from "@/components/AppLayout";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  return (
    <BranchProvider>
      <AppLayout session={session}>
        {children}
      </AppLayout>
    </BranchProvider>
  );
}

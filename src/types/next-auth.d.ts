import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      branchId: string | null
    }
  }

  interface User {
    role: string
    branchId: string | null
  }
}

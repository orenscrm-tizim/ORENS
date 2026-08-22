import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phone: { label: "Telefon raqam", type: "text", placeholder: "+998901234567" },
        password: { label: "Parol", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error("Telefon raqam yoki parol kiritilmagan");
        }

        const user = await prisma.user.findUnique({
          where: {
            phone: credentials.phone
          }
        });

        if (!user) {
          throw new Error("Foydalanuvchi topilmadi");
        }

        if (user.status !== "ACTIVE") {
          throw new Error("Akkaunt bloklangan yoki faol emas");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
          throw new Error("Parol noto'g'ri");
        }

        return {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          branchId: user.branchId,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.branchId = user.branchId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          role: token.role as string,
          branchId: token.branchId as string | null,
          id: token.sub as string
        };
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "default_secret_for_orens_dev_mode",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

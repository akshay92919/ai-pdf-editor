import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";

export const dynamic = "force-dynamic";
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Sign In",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "hello@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Auto-promote the specific admin email to ADMIN role if they registered previously
        if (user && user.email === "kumarakshay42569@gmail.com" && user.role !== "ADMIN") {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" }
          });
        }

        if (!user || !(await bcrypt.compare(credentials.password, user.passwordHash))) {
          throw new Error("Invalid email or password");
        }

        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-local-dev",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

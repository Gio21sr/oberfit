import NextAuth, { type NextAuthOptions, type User, type Session } from "next-auth";
import { type JWT } from "next-auth/jwt";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from 'bcryptjs';

// Tus mismas extensiones de tipos, ¡están perfectas!
declare module "next-auth" {
  interface User {
    role?: string | null;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string | null;
  }
}

// Aquí está tu objeto de configuración, ahora exportado
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        roleIntent: { label: "Role Intent", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials) return null;
        
        const user = await prisma.user.findFirst({
            where: { name: credentials.username }
        });

        if (!user || !user.password) return null;

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);
        
        if (!passwordMatch || user.role !== credentials.roleIntent) {
            return null;
        }

        return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? '';
        session.user.role = token.role;
      }
      return session;
    },
  },
};
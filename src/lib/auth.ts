// src/lib/auth.ts

import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from 'bcryptjs';
import { JWT } from "next-auth/jwt";
import { Session, User } from "next-auth";

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
        if (!credentials) {
          return null;
        }

        const username = credentials.username;
        const password = credentials.password;
        const roleIntent = credentials.roleIntent;

        const userInUnifiedTable = await prisma.user.findFirst({
            where: { name: username }
        });

        if (!userInUnifiedTable) {
            return null;
        }

        const passwordMatch = await bcrypt.compare(password, userInUnifiedTable.password || '');
        
        if (!passwordMatch) {
            return null;
        }

        if (userInUnifiedTable.role !== roleIntent) {
            return null;
        }

        return {
            id: userInUnifiedTable.id.toString(),
            name: userInUnifiedTable.name,
            email: userInUnifiedTable.email,
            role: userInUnifiedTable.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, trigger, session }: { token: JWT; user?: User; trigger?: "signIn" | "signUp" | "update"; session?: Session; }) {
        if (user) {
          token.id = user.id;
          token.role = user.role;
        }
        if (trigger === "update" && session && session.user) {
            token.role = session.user.role;
            token.name = session.user.name;
            token.email = session.user.email;
        }
        return token;
      },
      async session({ session, token }: { session: Session; token: JWT; }) {
        if (session.user) {
            session.user.id = token.id ?? '';
            session.user.role = token.role;
        }
        return session;
      },
  },
};
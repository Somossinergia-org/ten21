import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import type { Role } from "@prisma/client";

// Extend NextAuth types to include our custom fields
declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    tenantId: string;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      tenantId: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    tenantId: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        tenantId: { label: "Tenant", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.tenantId) {
          return null;
        }

        const user = await db.user.findUnique({
          where: {
            tenantId_email: {
              tenantId: credentials.tenantId,
              email: credentials.email,
            },
          },
        });

        if (!user || !user.active) {
          return null;
        }

        const passwordValid = await bcrypt.compare(credentials.password, user.password);
        if (!passwordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tenantId = user.tenantId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.tenantId = token.tenantId;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours (one work shift)
  },
};

export function getSession() {
  return getServerSession(authOptions);
}

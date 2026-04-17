import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import type { Role } from "@prisma/client";
import { checkRateLimit, verifyTotpCode } from "@/services/security.service";
import crypto from "crypto";

declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    tenantId: string;
    isSuperAdmin?: boolean;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      tenantId: string;
      isSuperAdmin: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    tenantId: string;
    isSuperAdmin: boolean;
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
        mfaCode: { label: "MFA Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.tenantId) {
          return null;
        }

        // P0: Rate limit login attempts (5 per minute per email+tenant)
        const rlKey = `login:${credentials.email}:${credentials.tenantId}`;
        if (!checkRateLimit(rlKey, 5, 60000)) {
          throw new Error("Demasiados intentos. Espera 1 minuto.");
        }

        const user = await db.user.findUnique({
          where: {
            tenantId_email: {
              tenantId: credentials.tenantId,
              email: credentials.email,
            },
          },
        });

        if (!user || !user.active) return null;

        // P0: Check lockout
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error("Cuenta bloqueada temporalmente.");
        }

        const passwordValid = await bcrypt.compare(credentials.password, user.password);
        if (!passwordValid) {
          const newCount = user.failedLoginCount + 1;
          await db.user.update({
            where: { id: user.id },
            data: {
              failedLoginCount: newCount,
              lockedUntil: newCount >= 5 ? new Date(Date.now() + 15 * 60000) : null,
            },
          });
          return null;
        }

        // P0: MFA enforcement
        const mfa = await db.userMfa.findUnique({ where: { userId: user.id } });
        if (mfa?.enabled) {
          if (!credentials.mfaCode) {
            throw new Error("MFA_REQUIRED");
          }
          try {
            const EK = (process.env.BACKUP_ENCRYPTION_KEY || "").slice(0, 32).padEnd(32, "!");
            const [ivHex, tagHex, encHex] = mfa.secretEncrypted.split(":");
            const iv = Buffer.from(ivHex, "hex");
            const decipher = crypto.createDecipheriv("aes-256-gcm", Buffer.from(EK), iv);
            decipher.setAuthTag(Buffer.from(tagHex, "hex"));
            const secret = Buffer.concat([decipher.update(Buffer.from(encHex, "hex")), decipher.final()]).toString("utf8");
            if (!verifyTotpCode(secret, credentials.mfaCode)) {
              throw new Error("Codigo MFA invalido");
            }
          } catch (e) {
            if (e instanceof Error && (e.message === "Codigo MFA invalido" || e.message === "MFA_REQUIRED")) throw e;
            throw new Error("Error verificando MFA");
          }
        }

        // Reset failed logins on success
        await db.user.update({
          where: { id: user.id },
          data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
        });

        const isSuperAdmin = await checkSuperAdmin(user.id, user.tenantId);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          isSuperAdmin,
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
        token.isSuperAdmin = user.isSuperAdmin ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.tenantId = token.tenantId;
      session.user.isSuperAdmin = token.isSuperAdmin;
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
};

async function checkSuperAdmin(userId: string, tenantId: string): Promise<boolean> {
  const flag = await db.featureFlag.findFirst({
    where: { code: "super_admin_user", scope: "TENANT", tenantId, enabled: true },
  });
  if (flag) return true;
  const firstTenant = await db.tenant.findFirst({ orderBy: { createdAt: "asc" } });
  if (firstTenant?.id !== tenantId) return false;
  const firstJefe = await db.user.findFirst({
    where: { tenantId, role: "JEFE" }, orderBy: { createdAt: "asc" },
  });
  return firstJefe?.id === userId;
}

export function getSession() {
  return getServerSession(authOptions);
}

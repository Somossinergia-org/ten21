import { db } from "@/lib/db";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import type { SecurityEventType, SecurityEventSeverity } from "@prisma/client";

const ENCRYPTION_KEY = (process.env.BACKUP_ENCRYPTION_KEY || "dev-key-change-me-32-bytes-long!").slice(0, 32).padEnd(32, "!");

// Simple AES-256-GCM encryption for MFA secrets
function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(ENCRYPTION_KEY), iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString("hex"), authTag.toString("hex"), encrypted.toString("hex")].join(":");
}

function decrypt(text: string): string {
  const [ivHex, tagHex, encrypted] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", Buffer.from(ENCRYPTION_KEY), iv);
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, "hex")), decipher.final()]).toString("utf8");
}

// Simple TOTP implementation
function base32Encode(buffer: Buffer): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let result = "";
  let bits = 0;
  let value = 0;
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      result += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) result += alphabet[(value << (5 - bits)) & 31];
  return result;
}

function base32Decode(str: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  str = str.toUpperCase().replace(/=+$/, "");
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;
  for (const c of str) {
    value = (value << 5) | alphabet.indexOf(c);
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

export function generateTotpSecret(): string {
  return base32Encode(crypto.randomBytes(20));
}

export function verifyTotpCode(secret: string, code: string, window = 1): boolean {
  const key = base32Decode(secret);
  const time = Math.floor(Date.now() / 30000);

  for (let i = -window; i <= window; i++) {
    const counter = Buffer.alloc(8);
    counter.writeBigInt64BE(BigInt(time + i), 0);
    const hmac = crypto.createHmac("sha1", key).update(counter).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    const binary = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) |
                   ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
    const otp = (binary % 1000000).toString().padStart(6, "0");
    if (otp === code) return true;
  }
  return false;
}

export function generateRecoveryCodes(): string[] {
  return Array.from({ length: 8 }, () =>
    crypto.randomBytes(5).toString("hex").toUpperCase().match(/.{1,5}/g)!.join("-"),
  );
}

export async function enableMfa(userId: string, tenantId: string, code: string) {
  const mfa = await db.userMfa.findUnique({ where: { userId } });
  if (!mfa) throw new Error("Primero genera el codigo QR");

  const secret = decrypt(mfa.secretEncrypted);
  if (!verifyTotpCode(secret, code)) throw new Error("Codigo invalido");

  const recoveryCodes = generateRecoveryCodes();
  const recoveryCodesHash = await bcrypt.hash(JSON.stringify(recoveryCodes), 10);

  await db.userMfa.update({
    where: { userId },
    data: { enabled: true, recoveryCodesHash },
  });

  return { recoveryCodes };
}

export async function initMfaSetup(userId: string, tenantId: string) {
  const secret = generateTotpSecret();
  const secretEncrypted = encrypt(secret);

  await db.userMfa.upsert({
    where: { userId },
    create: { userId, tenantId, secretEncrypted, recoveryCodesHash: "", enabled: false },
    update: { secretEncrypted, enabled: false },
  });

  const issuer = process.env.MFA_ISSUER_NAME || "TodoMueble";
  const otpauthUrl = `otpauth://totp/${issuer}?secret=${secret}&issuer=${issuer}`;
  return { secret, otpauthUrl };
}

export async function disableMfa(userId: string, code: string) {
  const mfa = await db.userMfa.findUnique({ where: { userId } });
  if (!mfa?.enabled) throw new Error("MFA no esta activo");

  const secret = decrypt(mfa.secretEncrypted);
  if (!verifyTotpCode(secret, code)) throw new Error("Codigo invalido");

  await db.userMfa.update({
    where: { userId },
    data: { enabled: false },
  });
}

export async function recordSecurityEvent(data: {
  tenantId?: string;
  userId?: string;
  severity: SecurityEventSeverity;
  type: SecurityEventType;
  ipAddress?: string;
  userAgent?: string;
  payload?: object;
}) {
  try {
    return await db.securityEvent.create({
      data: {
        tenantId: data.tenantId || null,
        userId: data.userId || null,
        severity: data.severity,
        type: data.type,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        payloadJson: data.payload ? data.payload as object : undefined,
      },
    });
  } catch (e) {
    console.error("[security] Failed to record event:", e);
    return null;
  }
}

export async function listSecurityEvents(filters?: { tenantId?: string; limit?: number }) {
  return db.securityEvent.findMany({
    where: filters?.tenantId ? { tenantId: filters.tenantId } : {},
    orderBy: { createdAt: "desc" },
    take: filters?.limit || 100,
  });
}

export async function registerFailedLogin(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const newCount = user.failedLoginCount + 1;
  const shouldLock = newCount >= 5;

  return db.user.update({
    where: { id: userId },
    data: {
      failedLoginCount: newCount,
      lockedUntil: shouldLock ? new Date(Date.now() + 15 * 60000) : null,
    },
  });
}

export async function resetFailedLogins(userId: string) {
  return db.user.update({
    where: { id: userId },
    data: {
      failedLoginCount: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    },
  });
}

// Simple in-memory rate limiter
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxRequests = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const bucket = rateLimitStore.get(key);

  if (!bucket || bucket.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= maxRequests) return false;
  bucket.count++;
  return true;
}

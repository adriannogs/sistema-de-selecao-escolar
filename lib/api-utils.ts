import crypto from "crypto"
import type { NextRequest } from "next/server"

export function validateApiKey(key: string | undefined): boolean {
  const adminKey = process.env.ADMIN_API_KEY
  if (!adminKey) return false
  return key === adminKey
}

export async function verifyAdminApiKey(request: NextRequest): Promise<boolean> {
  const apiKey = request.headers.get("x-admin-api-key")
  return validateApiKey(apiKey || undefined)
}

export function getClientIp(request: Request): string | null {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || null
}

export function generateProtocolo(): string {
  return "PRE-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substr(2, 5).toUpperCase()
}

export function generateHash(data: object): string {
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex")
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message)
  }
}

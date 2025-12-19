import { handlers } from "../../../../auth";
import type { NextRequest } from "next/server";

// Wrap handlers to satisfy Next.js 16 route handler type signature
// Using 'as any' to bypass NextRequest type mismatch between monorepo packages
export const GET = (req: NextRequest) => handlers.GET(req as any);
export const POST = (req: NextRequest) => handlers.POST(req as any);
export const dynamic = "force-dynamic";

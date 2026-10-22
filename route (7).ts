import { NextResponse } from "next/server";
import { databaseHealth } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = await databaseHealth();
  return NextResponse.json(status, { status: status.ok ? 200 : 503 });
}

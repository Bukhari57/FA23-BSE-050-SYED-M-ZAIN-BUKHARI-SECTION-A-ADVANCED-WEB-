import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    service: "adflow-pro",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}


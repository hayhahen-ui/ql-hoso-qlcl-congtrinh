import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "ql-hoso-qlcl-congtrinh",
    version: "3.0.0-kaizen",
    legal_baseline: ["207/2026/ND-CP", "32/2026/TT-BXD"],
    timezone: "Asia/Ho_Chi_Minh",
    timestamp: new Date().toISOString(),
  });
}

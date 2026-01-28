import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;
    
    console.log(`🔍 [${type}]`, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in debug log:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

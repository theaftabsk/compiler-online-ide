import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:5000';

export async function GET(req: NextRequest) {
  const targetUrl = `${BACKEND_URL}/api/sessions`;

  try {
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        ...(req.headers.get('authorization') ? { 'Authorization': req.headers.get('authorization')! } : {}),
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: `Backend connection error: ${err.message}` },
      { status: 502 }
    );
  }
}

export async function POST(req: NextRequest) {
  const targetUrl = `${BACKEND_URL}/api/sessions/create`;

  try {
    const body = await req.json();
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.get('authorization') ? { 'Authorization': req.headers.get('authorization')! } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: `Backend connection error: ${err.message}` },
      { status: 502 }
    );
  }
}

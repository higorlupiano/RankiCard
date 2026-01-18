import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { code, refresh_token } = body;

  const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Chaves do Strava não configuradas' }, { status: 500 });
  }

  let url = 'https://www.strava.com/oauth/token';
  let params: any = {
    client_id: clientId,
    client_secret: clientSecret,
  };

  if (code) {
    params.code = code;
    params.grant_type = 'authorization_code';
  } else if (refresh_token) {
    params.refresh_token = refresh_token;
    params.grant_type = 'refresh_token';
  } else {
    return NextResponse.json({ error: 'Faltou código ou token' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao falar com Strava' }, { status: 500 });
  }
}
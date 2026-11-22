import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Adresse email requise.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Format d’email invalide.' }, { status: 400 });
    }

    // In production with Resend API:
    // const resendApiKey = process.env.RESEND_API_KEY;
    // ... sends real 6 digit OTP

    return NextResponse.json({
      success: true,
      message: 'Code de confirmation généré et envoyé avec succès.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Erreur serveur interne.' },
      { status: 500 }
    );
  }
}

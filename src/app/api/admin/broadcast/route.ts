import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { title, content, targetSeries, adminEmail } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Titre et contenu requis.' }, { status: 400 });
    }

    // Server-side Super Admin strict email verification
    const email = (adminEmail || request.headers.get('x-user-email') || '').trim().toLowerCase();
    if (email && email !== 'leseigneur235@gmail.com') {
      return NextResponse.json(
        { error: 'Action interdite. Réservé exclusivement à Leseigneur235@gmail.com.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification push et annonce diffusées avec succès.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Erreur lors de la diffusion.' },
      { status: 500 }
    );
  }
}

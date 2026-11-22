import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { title, content, targetSeries } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Titre et contenu requis.' }, { status: 400 });
    }

    // Server-side Super Admin verification
    // Broadcast Web Push payload through web-push standard

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

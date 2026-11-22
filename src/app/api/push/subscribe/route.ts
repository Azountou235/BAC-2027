import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { subscription, userId } = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Abonnement push invalide.' }, { status: 400 });
    }

    // Persist in push_subscriptions table
    return NextResponse.json({
      success: true,
      message: 'Appareil enregistré pour les notifications push.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Erreur lors de l’enregistrement push.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/src/infrastructure/auth/auth';
import { UserRepository } from '@/src/infrastructure/database/UserRepository';
import { createSession } from '@/src/infrastructure/auth/session';

const authService = new AuthService(new UserRepository());

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    const isValid = await authService.validateCredentials({ email, password });

    if (!isValid) {
      return NextResponse.json(
        { error: 'Identifiants incorrects' },
        { status: 401 }
      );
    }

    const user = await authService.getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 401 }
      );
    }

    await createSession({
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

import { redirect } from 'next/navigation';
import { getSession } from '@/src/infrastructure/auth/session';

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    redirect('/factures');
  } else {
    redirect('/connexion');
  }
}

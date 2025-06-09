import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import Dashboard from '@/components/ui/Dashboard/Dashboard';
import LandingPage from '@/components/ui/LandingPage/LandingPage';

export default async function HomePage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  // If user is logged in, show dashboard
  if (user) {
    return <Dashboard user={user} />;
  }

  // If not logged in, show landing page
  return <LandingPage />;
}

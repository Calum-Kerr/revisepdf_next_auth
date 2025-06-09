import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import { enforceSubscriptionLimits } from '@/middleware/subscription-limits';
import { createClient } from '@/utils/supabase/server';

export async function middleware(request: NextRequest) {
  // First, update the session
  const response = await updateSession(request);

  // Check if this is an API route that needs subscription enforcement
  if (request.nextUrl.pathname.startsWith('/api/upload') ||
      request.nextUrl.pathname.startsWith('/api/process-pdf')) {

    // Get the current user
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Enforce subscription limits
      const limitResponse = await enforceSubscriptionLimits(request, user.id);
      if (limitResponse) {
        return limitResponse;
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};

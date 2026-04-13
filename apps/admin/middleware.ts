import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { response } = createClient(request);
  // Extend here to add auth-based route protection when Better Auth is in place.
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and images.
     * Add protected routes here as auth is implemented.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

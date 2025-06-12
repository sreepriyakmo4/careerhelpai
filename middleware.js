import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const protectedRoutes = [
  "/dashboard",
  "/resume",
  "/ai-cover-letter",
  "/onboarding",
  "/interview",
];

function isProtectedRoute(req) {
  const path = req.nextUrl.pathname;
  return protectedRoutes.some(route => path.startsWith(route));
}

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (!userId && isProtectedRoute(req)) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  return NextResponse.next();
});


export const config = {
  matcher: [
    // Match all pages except static files like .css, .js, images, etc.
    '/((?!_next|.*\\..*).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

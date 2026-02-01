// Middleware is disabled - authentication is now handled in API routes
// using lib/middleware/apiKeyAuth.ts

export async function middleware() {
  // Pass through all requests
  return;
}

export const config = {
  matcher: [],
};

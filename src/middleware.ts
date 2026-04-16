import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

// Protect all routes under /(app)/ group
// Allow: /login, /api/auth, /api/tenants, static assets
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/purchases/:path*",
    "/reception/:path*",
    "/incidents/:path*",
    "/vehicles/:path*",
    "/settings/:path*",
    "/customers/:path*",
    "/notifications/:path*",
    "/sales/:path*",
    "/inventory/:path*",
    "/post-sales/:path*",
    "/finance/:path*",
    "/executive/:path*",
    "/mobile/:path*",
    "/automations/:path*",
  ],
};

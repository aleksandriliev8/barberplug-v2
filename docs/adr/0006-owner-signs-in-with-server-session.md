# The Owner signs in with a server session, not JWT

There is exactly one Owner account, created from environment variables on first start; the Owner can change the password in the admin area, and v1 has no password-reset email. Spring Security keeps a server-side session in an HttpOnly, Secure, SameSite cookie with CSRF protection, and login attempts are rate limited. This works because CloudFront serves the frontend and routes `/api/*` to the backend on the same origin. JWT was rejected: it adds token storage and revocation problems for a single user.

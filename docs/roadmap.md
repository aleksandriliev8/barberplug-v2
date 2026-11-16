# Roadmap

The project is built in stages. Each stage ends with a review by the Owner of the repo before the next one starts.

Ground rules for every stage:
- Work on a `feature/*` branch, merged into `develop`; `main` is what is deployed.
- Every feature ships with tests: JUnit + Testcontainers for the backend, Vitest + Testing Library for the frontend.
- Real shop content (address, phone, photos, story text) is not needed yet: placeholders are marked `TODO-CONTENT` and replaced before launch.
- The domain is bought later in Route 53; AWS comes last, after everything works locally.

## Stages

1. **Foundation**: record decisions (ADRs 0004–0008), backend skeleton (Spring Boot, Flyway, health check, Maven wrapper).
2. **Frontend skeleton + CI**: Vite, React, TypeScript, Tailwind with the design tokens and fonts from MASTER.md, `/bg` and `/en` routing, header and footer, GitHub Actions running backend and frontend tests.
3. **Owner sign-in**: Owner account from env vars, session login, rate limit, change password, admin shell (sidebar, log out).
4. **Gallery**: upload pipeline (EXIF strip, WebP thumb + large, S3 via LocalStack), admin Gallery manager, public Gallery with lightbox.
5. **Editable Texts and Opening Hours**: storage, admin editors, public pages reading them.
6. **Public Sections**: Home, Learn More, Shop (coming soon), Location, Help with Contact Messages (Postgres + SES).
7. **SEO**: prerendered pages per Locale, meta tags, `hreflang`, sitemap, robots.txt.
8. **AWS**: Terraform (VPC, ECS Fargate, ALB, RDS, S3, CloudFront, SES, Route 53) and a deploy pipeline. CloudFront must 301 `/` to `/bg`, rewrite `/bg/gallery` to `/bg/gallery/index.html`, and serve `index.html` (the SPA shell) for unknown paths.

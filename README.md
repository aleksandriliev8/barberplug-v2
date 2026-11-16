# barberplug-v2

Website for the BarberPlug barbershop: public site in Bulgarian and English, plus an admin area where the Owner manages the Gallery and page texts.

## Stack

- **backend/**: Java 21, Spring Boot 3, Maven, Flyway, PostgreSQL
- **frontend/**: React, TypeScript, Vite, Tailwind
- **infra/**: Terraform for AWS (S3, CloudFront, ECS Fargate, RDS, SES, Route 53)
- **Local dev**: Docker Compose (Postgres + LocalStack for S3/SES)

## Local development

Needs Java 21, Node 24 (at least 22.22) and Docker.

```sh
docker compose up -d            # Postgres + LocalStack

cd backend && ./mvnw spring-boot:run   # API on http://localhost:8080
cd frontend && npm install && npm run dev   # site on http://localhost:5173/bg
```

Tests: `./mvnw verify` in `backend/`, `npm test` and `npm run typecheck` in `frontend/`. CI runs both on every push and pull request to `develop` and `main`.

## Docs

- [GLOSSARY.md](GLOSSARY.md): domain terms
- [docs/adr/](docs/adr/): architecture decisions
- [docs/roadmap.md](docs/roadmap.md): build stages
- [design-system/barberplug/MASTER.md](design-system/barberplug/MASTER.md): design system (colours, type, components)

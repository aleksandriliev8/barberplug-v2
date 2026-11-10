# barberplug-v2

Website for the BarberPlug barbershop: public site in Bulgarian and English, plus an admin area where the Owner manages the Gallery and page texts.

## Stack

- **backend/**: Java 21, Spring Boot 3, Maven, Flyway, PostgreSQL
- **frontend/**: React, TypeScript, Vite, Tailwind
- **infra/**: Terraform for AWS (S3, CloudFront, ECS Fargate, RDS, SES, Route 53)
- **Local dev**: Docker Compose (Postgres + LocalStack for S3/SES)

## Local development

```sh
docker compose up -d
```

## Docs

- [GLOSSARY.md](GLOSSARY.md): domain terms
- [docs/adr/](docs/adr/): architecture decisions
- [design-system/barberplug/MASTER.md](design-system/barberplug/MASTER.md): design system (colours, type, components)

# Production runs on ECS Fargate + RDS, chosen partly for learning

One barbershop's traffic would fit on a single small EC2 instance running Docker Compose (~$10–20/month). We chose ECS Fargate behind an ALB, RDS Postgres, S3 + CloudFront and Terraform (~$60–90/month) because a goal of this project is hands-on practice with real-world AWS services. Do not "simplify" to a single box without revisiting that goal.

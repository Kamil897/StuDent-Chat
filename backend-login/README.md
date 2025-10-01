# Backend

## Setup
1. Copy `.env.example` to `.env` and edit if needed.
2. `npm install`
3. `npx prisma generate`
4. Run MySQL via docker-compose in the project root: `docker-compose up -d`
5. `npx prisma migrate dev --name init`
6. `npm run start:dev`

## Seed initial accounts
Use the auth endpoints:
- POST /auth/register-creator
- POST /auth/register-admin
- POST /auth/login

# HMB Pro Wellness Center - Backend

A Node.js + TypeScript backend for the HMB Pro professional wellness center web application. It provides secure authentication with JWT, role-based authorization (patient, practitioner), and appointment management aligned with the frontend requirements.

## Tech Stack
- Node.js, Express
- TypeScript
- MongoDB, Mongoose
- JWT authentication
- CORS, dotenv
- Nodemon / ts-node-dev for development

## Features
- Authentication
  - Patient signup via API
  - Patient & practitioner login via API (returns role)
  - JWT-based auth; protected routes via `Authorization: Bearer <token>`
- Authorization
  - Roles: `patient`, `practitioner`
  - Patients: can create and view their own appointments
  - Practitioners: can view, update, and delete their own appointments
- Appointments
  - Fields: `date`, `time`, `practitioner`, `appointmentType` (initial|followup), `patientInfo` (firstName, lastName, dateOfBirth, placeOfBirth?, email, phone, concern, medicalHistory?), `status` (pending|confirmed|completed|cancelled), `notes?`
  - Unique constraint by `(practitioner, date, time)` to prevent double booking
- Patient self-service
  - Update self (name/password), delete self (cascades patient appointments)
- Admin-less workflow
  - Practitioners are created via a secure CLI script; no admin role

## Project Structure
```
src/
  config/        env.ts, db.ts
  controllers/   authController.ts, appointmentController.ts, userController.ts
  middleware/    auth.ts
  models/        User.ts, Appointment.ts
  routes/        authRoutes.ts, appointmentRoutes.ts, userRoutes.ts
  app.ts         Express app wiring
  server.ts      Bootstrap & DB connection
scripts/
  createPractitioner.ts  // CLI to create practitioners
```

## Getting Started
1) Prerequisites
- Node.js LTS (v18+ recommended)
- MongoDB connection string

2) Install dependencies
```bash
npm install
```

3) Environment variables
Create `.env` in the project root (do not commit it). See `.env.example`.
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=replace-with-strong-secret
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

4) Development
- With nodemon auto-reload:
```bash
npm run dev
```
- With ts-node-dev (optional):
```bash
npm run dev:tsnd
```

5) Build & run (production)
```bash
npm run build
npm start
```

## CLI: Create Practitioner
Create a practitioner account (practitioners cannot sign up from frontend):
```bash
# Using flags
npm run create:practitioner -- --email doc@example.com --password StrongPass123 --name "Dr. Smith"

# Or using positional args (works around npm flag parsing)
npm run create:practitioner -- doc@example.com StrongPass123 "Dr. Smith"
```

## API
Base URL: `http://localhost:<PORT>/api`

### Auth
- POST `/auth/signup` (patient only)
  - body: `{ name, email, password }`
  - response: `{ token, user: { id, name, email, role } }`
- POST `/auth/login`
  - body: `{ email, password }`
  - response: `{ token, user: { id, name, email, role } }`
- GET `/auth/me` (auth)
  - response: `{ id, name, email, role }`

### Users (patient self-service)
- PUT `/users/me` (auth: patient)
  - body: `{ name?, password? }`
- DELETE `/users/me` (auth: patient)
  - deletes account and patient appointments

### Appointments
Headers: `Authorization: Bearer <token>`

- POST `/appointments` (auth: patient)
  - body:
    ```json
    {
      "date": "2025-09-12",
      "time": "10:30",
      "practitioner": "<userId>",
      "appointmentType": "initial",
      "patientInfo": {
        "firstName": "John",
        "lastName": "Doe",
        "dateOfBirth": "1990-01-01",
        "placeOfBirth": "City",
        "email": "john@example.com",
        "phone": "+1234567890",
        "concern": "Back pain",
        "medicalHistory": "..."
      },
      "notes": "Optional notes"
    }
    ```
- GET `/appointments` (auth)
  - patient: returns own appointments
  - practitioner: returns own appointments
- GET `/appointments/:id` (auth)
  - ownership enforced (patient or practitioner on the record)
- PUT `/appointments/:id` (auth: practitioner)
  - body: any subset of `{ date, time, appointmentType, patientInfo (partial), notes, status }`
- DELETE `/appointments/:id` (auth: practitioner)

## Security & Best Practices
- JWT secrets must be strong and kept out of source control (.env)
- CORS origin configured via `CORS_ORIGIN`
- Passwords stored using bcrypt hashing
- Minimal role set (patient, practitioner) to reduce risk surface

## Scripts
- `npm run dev` – nodemon + ts-node auto-reload
- `npm run dev:tsnd` – ts-node-dev alternative
- `npm run build` – compile TypeScript to `dist/`
- `npm start` – run compiled server
- `npm run create:practitioner` – CLI to create practitioner accounts

## Contribution
- Use feature branches and pull requests
- Keep code formatted and typed; follow existing style
- Add unit/integration tests as the project evolves

## License
ISC

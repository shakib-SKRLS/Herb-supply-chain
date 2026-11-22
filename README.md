# Herb-supply-chain

A herb supply-chain traceability website — transparency between herb suppliers and consumers, with lab results and QR-code verification.

## Tech
- Backend: Node.js, Express 4, MongoDB with Mongoose, JWT (`jsonwebtoken`) and bcryptjs, Helmet, CORS, cookie-parser
- Frontend: React 18 (Create React App), React Router, Bootstrap, `web3`, QR scanning / QR codes
- Roles: processor, lab, consumer, admin

## API endpoints
Base path: `/api` (backend port 5000 by default).

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | Health check with herb counts |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Current user (auth required) |
| GET | `/api/auth/logout` | Log out (auth required) |
| GET | `/api/herbs` | List herbs |
| POST | `/api/herbs` | Create a herb (processor, admin, lab) |
| GET | `/api/herbs/qr/:code` | Get a herb by QR code |
| GET | `/api/herbs/:id` | Get a herb |
| PUT | `/api/herbs/:id` | Update a herb |
| DELETE | `/api/herbs/:id` | Delete a herb |
| GET | `/api/farmers` | List farmers |
| POST | `/api/farmers` | Create a farmer (processor, admin) |
| GET | `/api/orders` | List orders (auth required) |
| POST | `/api/orders` | Create an order (consumer, admin) |
| GET | `/api/lab-results` | List lab results (lab, admin) |
| POST | `/api/lab-results` | Create a lab result (lab, admin) |
| GET | `/api/lab-results/herb/:herbId/latest` | Latest lab result for a herb |
| GET | `/api/users` | List users (admin only) |

## How to run
```bash
cd backend
npm install
cp .env.example .env   # MONGODB_URI, JWT secret, PORT (default 5000)
npm run dev            # nodemon server.js
npm run seed           # seed script in backend/scripts/seed.js
```
```bash
cd frontend
npm install
npm start
```

## License
MIT

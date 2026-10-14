# PujaConnect – Online Pandit & Puja Booking Platform

PujaConnect is a web-based platform that helps users discover and book Pandits for religious ceremonies. Users can explore rituals, view Pandit profiles, and manage their bookings. Pandits can manage their profiles and booking requests, while administrators can verify Pandits and manage platform activities.


## Live Demo

**Live Application:** https://pujaconnect-lac.vercel.app/

**GitHub Repository:** https://github.com/iamraj333/PujaConnect

## Features

### User
- User registration and login.
- Browse available rituals and Pandit profiles.
- Create and manage puja bookings.
- View booking history and status.
- Submit feedback and raise disputes.

### Pandit
- Register and manage profile details.
- Manage supported rituals and availability.
- View booking requests.
- Accept or reject bookings.
- Mark bookings as completed.

### Admin
- Manage users and Pandit accounts.
- Verify or reject Pandit registrations.
- Manage rituals and puja categories.
- Monitor bookings and disputes.
- Review and resolve disputes.

## Technology Stack

**Frontend**
- React.js
- Vite
- JavaScript
- Tailwind CSS

**Backend**
- Node.js
- Express.js
- REST APIs
- JWT authentication
- Cookie-based authentication

**Database**
- MongoDB
- Mongoose

**Deployment**
- Vercel (Frontend)
- Render (Backend)
- MongoDB Atlas (Database)

## Project Structure

```text
pujaConnect/
├── client/       # React frontend
├── server/       # Express backend
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites
- Node.js and npm
- MongoDB Atlas account or a local MongoDB instance
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/iamraj333/PujaConnect
cd PujaConnect
```

### 2. Set Up the Backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory and configure the environment variables required by the backend.

Example:

```env
PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET_KEY=your_private_jwt_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
ADMIN_EMAIL=admin email
ADMIN_PASSWORD=admin password

```

Start the backend:

```bash
npm start
```

If your `server/package.json` does not define a start script, use:

```bash
node server.js
```

### 3. Set Up the Frontend

Open a separate terminal:

```bash
cd client
npm install
```

Create a `.env` file inside `client`:

```env
VITE_SERVER_URL=http://localhost:5000
```

Set this variable to your deployed backend URL when running the deployed frontend. Vite environment variables prefixed with `VITE_` are publicly exposed, so never store secrets in them.

Start the frontend:

```bash
npm run dev
```

Open the local URL shown in the terminal.

## Deployment

- **Frontend:** Deployed on Vercel.
- **Backend:** Deployed on Render.
- **Database:** Hosted on MongoDB Atlas.

Configure the required environment variables in the respective deployment dashboards. Ensure the backend CORS configuration allows the deployed frontend origin and supports credentials where required.

## Security

- Authentication uses JWT and cookies.
- Protected routes restrict access to authorized users.
- Role-based access separates user, Pandit, and admin operations.
- Database credentials and JWT secrets must remain private.
- Production cookies and CORS must be configured for the deployed domains.

## Future Enhancements

- Online payments and donations.
- Puja reminder notifications.
- Expanded regional language support.
- Live puja streaming.
- Mobile applications.

## Project Objective

PujaConnect aims to make Pandit discovery and puja booking more organized, accessible, and transparent by bringing users, Pandits, and administrators together on a single platform.

---

## Author

#### **Rajkumar Gupta**
(Full Stack Developer)

<br/>Github Link: https://github.com/iamraj333
<br/>LinkedIn Link: https://www.linkedin.com/in/guptarajkumar
<br/>Portfolio Link: https://www.rajcraft.online
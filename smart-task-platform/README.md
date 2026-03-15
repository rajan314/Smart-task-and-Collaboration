# 🚀 Smart Task & Collaboration Platform

A full-stack task management system built with **React.js**, **Node.js**, **Express.js**, and **MongoDB** — featuring JWT authentication, role-based access control, and a clean collaborative workflow.

---

## 📸 Features

- 🔐 JWT-based Authentication (Register / Login / Logout)
- 👥 Role-Based Access Control (Admin, Manager, Member)
- 📁 Project Management (Create, Read, Update, Delete)
- ✅ Task Management with status tracking (Todo → In Progress → Done)
- 👤 User management & team collaboration
- 🛡️ Protected routes on both frontend and backend
- 📬 RESTful API tested with Postman

---

## 🗂️ Project Structure

```
smart-task-platform/
├── backend/              # Node.js + Express + MongoDB API
│   ├── config/           # DB connection
│   ├── controllers/      # Route handlers
│   ├── middleware/        # Auth & role middleware
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   └── server.js
│
├── frontend/             # React.js client
│   └── src/
│       ├── components/   # UI components
│       ├── context/      # Auth context
│       ├── hooks/        # Custom hooks
│       ├── services/     # Axios API calls
│       └── utils/        # Helpers
│
└── README.md
```

---

## ⚙️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React.js, React Router, Axios     |
| Backend    | Node.js, Express.js               |
| Database   | MongoDB, Mongoose                 |
| Auth       | JWT, bcryptjs                     |
| Styling    | CSS Modules / Custom CSS          |

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/smart-task-platform.git
cd smart-task-platform
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart-task-platform
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

Start the server:

```bash
npm run dev
```

Backend runs on: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

---

## 📡 API Endpoints

### Auth
| Method | Endpoint              | Description         | Access  |
|--------|-----------------------|---------------------|---------|
| POST   | `/api/auth/register`  | Register new user   | Public  |
| POST   | `/api/auth/login`     | Login user          | Public  |
| GET    | `/api/auth/me`        | Get current user    | Private |

### Users
| Method | Endpoint              | Description         | Access  |
|--------|-----------------------|---------------------|---------|
| GET    | `/api/users`          | Get all users       | Admin   |
| GET    | `/api/users/:id`      | Get user by ID      | Private |
| PUT    | `/api/users/:id`      | Update user         | Private |
| DELETE | `/api/users/:id`      | Delete user         | Admin   |

### Projects
| Method | Endpoint                  | Description           | Access   |
|--------|---------------------------|-----------------------|----------|
| GET    | `/api/projects`           | Get all projects      | Private  |
| POST   | `/api/projects`           | Create project        | Manager+ |
| GET    | `/api/projects/:id`       | Get project by ID     | Private  |
| PUT    | `/api/projects/:id`       | Update project        | Manager+ |
| DELETE | `/api/projects/:id`       | Delete project        | Admin    |
| POST   | `/api/projects/:id/members` | Add member          | Manager+ |

### Tasks
| Method | Endpoint                      | Description         | Access   |
|--------|-------------------------------|---------------------|----------|
| GET    | `/api/tasks`                  | Get all tasks       | Private  |
| POST   | `/api/tasks`                  | Create task         | Member+  |
| GET    | `/api/tasks/:id`              | Get task by ID      | Private  |
| PUT    | `/api/tasks/:id`              | Update task         | Member+  |
| DELETE | `/api/tasks/:id`              | Delete task         | Manager+ |
| GET    | `/api/projects/:id/tasks`     | Get project tasks   | Private  |

---

## 🔑 Roles & Permissions

| Permission         | Admin | Manager | Member |
|--------------------|-------|---------|--------|
| View projects      | ✅    | ✅      | ✅     |
| Create project     | ✅    | ✅      | ❌     |
| Delete project     | ✅    | ❌      | ❌     |
| Create task        | ✅    | ✅      | ✅     |
| Delete task        | ✅    | ✅      | ❌     |
| Manage users       | ✅    | ❌      | ❌     |

---

## 🧪 Testing with Postman

Import the collection or manually test:

1. Register a user → `POST /api/auth/register`
2. Login → `POST /api/auth/login` → copy the `token`
3. Add header: `Authorization: Bearer <token>`
4. Start making authenticated requests

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

## 🙋‍♂️ Author

Built with ❤️ — add your name here!

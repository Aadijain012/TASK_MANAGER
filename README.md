# Team Task Manager

A production-ready full-stack web application built using the MERN stack (MongoDB, Express.js, React, Node.js) with Tailwind CSS. It features robust Role-Based Access Control (Admin/Member) and an Activity Log.

## ⚙️ Tech Stack
- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT & bcrypt

## 🔐 Authentication & Roles
- Single login system with JWT authentication.
- **Admin**: Has full control. Can view all users, create/delete projects, assign tasks, and view the activity log and full statistics.
- **Member**: Can view assigned projects, view tasks assigned to them, and update the status of their own tasks.

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on port 27017 or a valid MongoDB URI.

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Environment Variables

Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/team-task-manager-v2
JWT_SECRET=supersecretjwtkey_change_in_production
NODE_ENV=development
```

*(Optional)* Create a `.env` file in the `frontend` folder for production deployment:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the Application

**Run Backend (from `backend` folder):**
```bash
npm run dev
```

**Run Frontend (from `frontend` folder):**
```bash
npm run dev
```

## 🌐 API Endpoints

### Auth:
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user

### Users:
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/me` - Get current user profile

### Projects:
- `POST /api/projects` - Create a new project (Admin only)
- `GET /api/projects` - Get projects (Admin gets all, Member gets assigned projects)
- `GET /api/projects/:id` - Get specific project
- `PUT /api/projects/:id` - Update project (Admin only)
- `DELETE /api/projects/:id` - Delete a project (Admin only)

### Tasks:
- `POST /api/tasks` - Create task and assign to user (Admin only)
- `GET /api/tasks` - Get tasks (Filtered by role)
- `PUT /api/tasks/:id` - Update task status (Member) or full task (Admin)
- `DELETE /api/tasks/:id` - Delete task (Admin only)

### Activity Log:
- `GET /api/activities` - View the system activity log (Admin only)

# MERN Learning Management System (LMS)

This project is a comprehensive, full-stack Learning Management System built using the MERN stack (MongoDB, Express.js, React.js, Node.js). It supports role-based access for Admins, Faculty, and Students, offering interactive features like live classes, assessments, and discussion forums.

## 🚀 Key Features

*   **Role-Based Access Control:** Separate dashboards and permissions for Admin, Faculty, and Student users.
*   **Secure Authentication:** User registration, login, and mandatory OTP-based email verification using Nodemailer.
*   **Course Management:** Faculty can create courses, structure them into modules, and upload lectures/content.
*   **Assessment System:** Faculty can create MCQ-based tests. Students can attempt tests with a timer and view their results.
*   **Live Classes:** Real-time virtual classrooms using WebSockets (Socket.io) with integrated live chat.
*   **Student Engagement:** Course-specific discussion forums where students and faculty can interact.
*   **AI Chatbot Integration:** Architecture set up for an AI learning assistant to help students (in progress).

## 🛠️ Technology Stack

**Frontend:**
*   React.js (with Vite)
*   Tailwind CSS (for styling)
*   React Router DOM (for navigation)
*   Socket.io-client (for real-time features)
*   Axios (for API requests)

**Backend:**
*   Node.js & Express.js
*   MongoDB & Mongoose (Database & ORM)
*   Socket.io (WebSockets)
*   JSON Web Tokens (JWT) for secure authentication
*   Nodemailer for sending OTP emails
*   Bcryptjs for password hashing

---

## 📂 Project Structure & Analysis (Kya Kahan Ho Raha Hai)

The project is divided into two main directories: `backend` and `frontend`.

### 1. Backend (`/backend`)
Handles the database, API logic, authentication, and real-time socket connections.

*   **`server.js`**: The main entry point. It connects to MongoDB, sets up Express middleware, initializes Socket.io for live classes, and registers all API routes.
*   **`/models`**: Contains MongoDB schemas.
    *   `User.js`: Stores user details, roles, and OTP/verification status.
    *   `Course.js`, `Module.js`, `Lecture.js`: Defines the structure of educational content.
    *   `Test.js`, `Result.js`: Schemas for assessments and student scores.
    *   `Discussion.js`: Stores forum threads and replies.
    *   `LiveSession.js`: Manages active live class sessions.
*   **`/routes`**: Contains the API endpoints.
    *   `auth.js`: Handles `/register`, `/login`, `/verify-email`, and OTP logic.
    *   `courses.js`, `modules.js`: Endpoints for CRUD operations on courses and content.
    *   `tests.js`: API for creating and submitting tests.
    *   `discussions.js`: API for forum messages.
*   **`/middleware`**: Contains authentication and authorization middleware (e.g., verifying JWT tokens before accessing private routes).

### 2. Frontend (`/frontend`)
The React application handling the User Interface.

*   **`src/App.jsx`**: Main routing file. Defines protected routes (`PrivateRoute`) that ensure only verified and logged-in users can access the dashboard, courses, and tests.
*   **`src/contexts/AuthContext.jsx`**: Global state management for authentication. Stores user data and handles login/logout states across the application.
*   **`src/pages/`**: Contains the main views for the application:
    *   `Login.jsx`, `Register.jsx`, `VerifyEmail.jsx`: The authentication flow UI.
    *   `Dashboard.jsx`: The central hub after login (differs by role).
    *   `Courses.jsx`, `CourseDetail.jsx`: Viewing available courses and their content.
    *   `LiveClass.jsx`: The UI for joining a real-time class via Socket.io.
    *   `TestCreate.jsx`, `TestAttempt.jsx`, `TestResults.jsx`: The complete assessment UI flow.
*   **`src/components/`**: Reusable UI components.
    *   `Navbar.jsx`: Top navigation bar.
    *   `DiscussionForum.jsx`: Interactive forum component used inside course details.

---

## ⚙️ How to Run the Project Locally

### Prerequisites
*   Node.js installed
*   MongoDB running locally or a MongoDB Atlas URI

### 1. Setup Backend
1. Open a terminal and navigate to the backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file in the `backend` folder with the following variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/mern-lms
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```
4. Start the backend server: `npm run dev` (Runs on port 5000)

### 2. Setup Frontend
1. Open a new terminal and navigate to the frontend folder: `cd frontend`
2. Install dependencies: `npm install`
3. Start the frontend development server: `npm run dev` (Runs on Vite's default port, e.g., 5173)

Access the frontend via your browser, register a new account, verify the OTP, and start exploring the LMS!

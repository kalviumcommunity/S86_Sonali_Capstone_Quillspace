# Quillspace - Full-Stack Blogging Platform

QuillSpace is a modern full-stack blogging platform for creating, publishing, discovering, and managing written content. It provides a focused writing experience, user profiles, content discovery, and engagement features through a responsive web application.

Overview

QuillSpace is built as a self-hosted blogging platform with a React-based frontend, Node.js and Express backend, and MongoDB database.

The application is designed around three primary workflows:

Create and manage blog content
Discover and read content from other authors
Build and manage an author profile
Features
User registration and authentication
Google OAuth authentication
JWT-based protected routes
Create, edit, publish, and manage blog posts
Draft management
Markdown-based content creation
Blog cover image uploads
Category-based content organization
Search and content discovery
User profiles
Followers and following
Post likes, bookmarks, comments, and views
Responsive dark-mode interface
Author-specific post management
Optional profile information and social links
Tech Stack
Frontend
React
Vite
React Router
Styled Components
Axios
Backend
Node.js
Express.js
Multer
JSON Web Tokens
Google OAuth
Database
MongoDB
Mongoose
Deployment
Netlify — frontend
Render — backend
MongoDB Atlas — database
Architecture
                    QuillSpace
                        |
              +---------+---------+
              |                   |
          Frontend             Backend
        React + Vite       Node.js + Express
              |                   |
              | REST API          |
              +---------+---------+
                        |
                     MongoDB
                    + Mongoose

The frontend communicates with the backend through REST APIs. Authentication, authorization, content management, and database operations are handled by the backend.

Project Structure
QuillSpace/
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── services/
│       ├── hooks/
│       ├── context/
│       ├── utils/
│       └── App.jsx
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   └── server.js
│
├── .gitignore
└── README.md

The structure may evolve as the application grows.

Requirements

Before running QuillSpace locally, ensure the following are installed:

Node.js 18+
npm
MongoDB Atlas account or local MongoDB instance
Git
Installation

Clone the repository:

git clone <repository-url>
cd QuillSpace

Install frontend dependencies:

cd frontend
npm install

Install backend dependencies:

cd ../backend
npm install
Environment Configuration

Create a .env file in the backend directory.

PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=http://localhost:5173

Do not commit environment files or credentials to the repository.

Running Locally

Start the backend:

cd backend
npm start

Start the frontend in a separate terminal:

cd frontend
npm run dev

The application will be available at:

Frontend: http://localhost:5173
Backend:  http://localhost:3000
Authentication

QuillSpace uses JWT-based authentication for protected application resources and Google OAuth for social authentication.

Authenticated requests are validated through backend middleware before protected operations are performed.

Sensitive configuration such as database credentials, JWT secrets, and OAuth credentials is stored through environment variables.

API

The backend exposes RESTful endpoints for the main application resources.

Typical resource groups include:

/api/auth
/api/users
/api/posts
/api/comments
/api/bookmarks

The exact endpoints and request formats are defined by the backend implementation.

Database

MongoDB stores the application's primary data, including:

Users
Blog posts
Comments
Bookmarks
Relationships
Engagement data

Mongoose is used for schema definition, validation, and database interaction.

Production Deployment
Frontend

Build the frontend:

npm run build

The generated dist directory can be deployed to a static hosting provider such as Netlify.

Backend

The Express application can be deployed to a Node.js-compatible hosting platform such as Render.

Production environment variables should be configured through the hosting provider rather than committed to the repository.

Database

MongoDB Atlas is recommended for the production database.

Ensure that:

Database credentials are stored securely
Network access is correctly configured
Production credentials are separate from development credentials
Database access is restricted appropriately
Production Considerations

Before deploying QuillSpace to production, verify:

Environment variables are configured securely
Debug logging is disabled where appropriate
CORS allows only trusted frontend origins
Authentication middleware protects private routes
User input is validated and sanitized
File uploads have appropriate size and type restrictions
Database credentials are not exposed to the frontend
API errors do not expose sensitive implementation details
Production database access is properly restricted
HTTPS is enabled for deployed services
Development Workflow

Create a feature branch before making changes:

git checkout -b feature/profile-improvements

Commit changes using descriptive messages:

git add .
git commit -m "feat: improve profile layout"

Push the branch:

git push origin feature/profile-improvements

Open a pull request for review before merging changes into the main branch.

Roadmap

Planned improvements may include:

Advanced content editor
Improved search and filtering
Personalized content recommendations
Notification system
Author analytics
Improved content moderation
Performance optimization
Expanded mobile support
License

This project is currently intended for development and educational use.

If QuillSpace is released publicly, add the appropriate open-source license and copyright information here.

Author

QuillSpace is developed as a full-stack web application using the MERN ecosystem.

QuillSpace — A focused space for writing, publishing, and discovering ideas.
# Quillspace – A Self-Hosted Platform for Long-Form Writing and Knowledge Sharing

## 📌 Project Overview
Quillspace is a self-hosted, full-stack blog platform for writers, developers, and educators seeking a distraction-free, Markdown-based writing space.  
It offers full control over content and data, unlike commercial platforms like Medium or Substack.  
Users can create rich text posts, upload images, and engage through likes and comments.  
The platform supports social sharing and full CRUD operations.  
Ideal for professional blogging, personal journals, and educational publishing.


## ✨ Key Features

### 📝 Markdown + Rich Text Editor  
A distraction-free writing environment supporting **Markdown** and **rich text formatting** for flexible long-form content creation.

### 🔐 User Authentication  
Login system with support for both **email/password** and **Google OAuth**, giving users secure and convenient access options.

### 🖼️ Media Uploads  
Users can **upload and embed images** directly into posts, enabling visually enriched articles.

### 🔁 RESTful API Integration  
Full **CRUD functionality** (Create, Read, Update, Delete) for posts, comments, and users, exposed through well-structured REST APIs.

### 💬 Engagement Features  
Interactive capabilities such as **likes**, **threaded comments**, and **social sharing** (e.g., Twitter, LinkedIn) to increase engagement.

### 🗃️ Full Content Ownership  
Quillspace is **fully self-hosted**, allowing users to control all their data and deployment settings.

### 📱 Responsive Editorial UI  
Modern, mobile-responsive UI built based on **Figma-inspired designs**, optimized for clean readability and usability.

### 🔒 JWT-Based Security  
All authenticated routes are protected using **JSON Web Tokens (JWTs)**, ensuring secure session management.

### 📂 Component-Based Architecture  
Built using **React.js**, with modular and reusable components for scalability and maintainability.


### 🛠️ Tech Stack

Frontend: React.js, Styled Components
Backend: Node.js, Express.js, Multer
Database: MongoDB with Mongoose ODM
Authentication: Email/Password (JWT), Google OAuth
Hosting: Netlify (Frontend), Render (Backend)
API: RESTful APIs supporting full CRUD operations 


## 🗓️ 6-Week Plan (35 Days)

### Week 1: Design & Setup  
- Day 1: Created a low-fidelity design (wireframes in Figma)  
- Day 2: Created a high-fidelity design (Figma mockups)  
- Day 3: Setting up a GitHub project (repository, README)  
- Day 4: Manage daily tasks and milestones on GitHub Projects (start tracking concepts)  
- Day 5: Backend and frontend setup (folder structure, install dependencies)  
- Day 6: MongoDB connection setup, environment variables, and initial database schema creation  

### Week 2: Backend Development – Core APIs & Database  
- Day 7: Database schema for users, posts, comments; relationships between entities  
- Day 8: Implement POST APIs (users, posts, comments)  
- Day 9: Implement GET APIs (fetch posts, comments, user data)  
- Day 10: Implement PUT APIs (update posts, comments, user profiles)  
- Day 11: Implement DELETE APIs (posts, comments)  
- Day 12: Deploy backend server and add centralized error handling  

### Week 3: Authentication & API Testing  
- Day 13: Implement authentication schema (user roles, JWT tokens)  
- Day 14: Implement authentication POST and GET APIs (signup/login)  
- Day 15: Implement authentication PUT and DELETE APIs (update/delete accounts)  
- Day 16: Implement Google OAuth for 3rd party authentication  
- Day 17: Backend integration testing (Postman/Bruno) and update API templates  
- Day 18: Initialize React frontend application and create reusable components  

### Week 4: Frontend Development – Core UI & Features  
- Day 19: Create frontend pages: Home, User Profile, Signup, and Login  
- Day 20: Create user dashboard and post creation/editing pages (Markdown editor)  
- Day 21: Create post listing, threaded comments, and likes UI components  
- Day 22: Implement file upload functionality (frontend + backend)  
- Day 23: Connect frontend with backend APIs (posts, comments, authentication)  
- Day 24: Implement update and delete functionality in React app for entities  

### Week 5: Frontend Deployment & Polishing  
- Day 25: Deploy frontend server on Netlify  
- Day 26: UI polishing and ensuring frontend matches high-fidelity designs  
- Day 27: Testing frontend-backend integration and fixing bugs  
- Day 28: Continue managing project milestones on GitHub (proof of >10 entries)  
- Day 29: Complete any incomplete work or features  
- Day 30: Full integration testing and security checks using JWT  

### Week 6: Testing, Feedback & Finalization  
- Day 31: Comprehensive manual testing of all flows (posting, commenting, authentication)  
- Day 32: Peer testing and collecting feedback  
- Day 33: Apply feedback and improve UI/UX accordingly  
- Day 34: Re-test APIs and frontend for stability and performance  
- Day 35: Final documentation, project submission, and final GitHub milestone update

## frontend deployement link:
- https://quillspace.netlify.app/


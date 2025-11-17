📌 Task Manager – Node.js + Express + PostgreSQL + EJS

A full-stack task management web app with user login, sessions, secure password hashing, and per-user tasks.
Includes a special Guest Mode where users can add tasks without registering.

🚀 Features
✅ User Authentication

Register new users

Secure login using bcrypt hashing

Sessions using express-session

Persistent login (stays logged in until session expires)

✅ Task Management

Add tasks

Edit tasks

Delete tasks

Tasks are connected to logged-in users via user_id

Ensures users can edit/delete only their own tasks

✅ Guest Mode

Button /constant assigns user_id = 1

Guest can add tasks without login

All guest-mode tasks belong to the constant user

✅ PostgreSQL Integration

users table stores user information

works table stores tasks with foreign key relation

Uses parameterized queries to prevent SQL Injection

✅ EJS Frontend

Clean UI

Displays tasks

Shows logged-in username

Logout / login UI toggle


📁 Project Structure
project-folder/
│
├── public/              # CSS / assets
├── views/               # EJS templates
│   ├── index.ejs
│   └── partials/
│       ├── header.ejs
│       └── footer.ejs
│
├── server.js            # Main Express server
├── package.json
└── README.md




Real-Time Chat Application with Collaboration & Emotion Detection

A modern, feature-rich real-time communication platform built to enhance teamwork and emotional understanding during conversations. This application allows users to chat, collaborate on shared tasks, and automatically detect the emotional tone of messages using machine learning.

🚀 Features
1. Real-Time Messaging

Instant one-to-one or group chat

Typing indicators and online/offline status

Message delivery and read receipts

2. Real-Time Collaboration

Shared workspace for simultaneous editing

Live document/notes collaboration

User presence detection (who is editing what)

3. Emotion Detection (AI/ML)

Uses NLP/machine learning to analyze messages

Classifies emotions like happy, sad, angry, neutral, surprised, etc.

Emotion tag or emoji added automatically with each message

Helps improve communication clarity and team well-being

4. Authentication & User Management

Secure login and signup

JWT-based authenticated routes

User profiles with avatars

5. Clean UI & Modern Frontend

Responsive interface

Smooth chat experience with message threads

Dark/Light mode support (optional)

🛠️ Tech Stack
Frontend

React.js / Next.js

TailwindCSS

Socket.io-client

Backend

Node.js / Express.js

Socket.io

REST APIs

Emotion detection model (Python/Node ML library — whichever you used)

Database

MongoDB / Firebase (your preference)

🧠 Emotion Detection Pipeline

Preprocessing of chat messages (stopwords, lemmatization)

Model predictions using trained classifier (SVM, LSTM, BERT, etc.)

Assigns an emotion category

Returns emotion tag to UI in real time via sockets


📦 Installation & Setup
1. Clone the Repository
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

2. Install Dependencies

Frontend:

cd client
npm install


Backend:

cd server
npm install

3. Configure Environment Variables

Create .env files for both client and server:

Backend .env

MONGO_URI=your_mongo_url
JWT_SECRET=your_secret
PORT=5000


Frontend .env

REACT_APP_SERVER_URL=http://localhost:5000

4. Start the Project

Backend:

npm start


Frontend:

npm start

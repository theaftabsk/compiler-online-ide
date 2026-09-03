# 🚀 CodeLab Online IDE & Centralized Digital Programming Lab

> **A Universal, Multi-Tenant Educational SaaS & On-Premise Platform for Computer Labs in Universities and Colleges.**

---

## 📁 Project Architecture & Structure

```
online c compiler/
├── SYSTEM_IMPLEMENTATION_PLAN.md   # Master engineering & architecture blueprint
├── docker-compose.yml              # 1-Click deployment for any campus LAN server
├── fronted/                        # Web client (Monaco Editor + Live 60-PC Grid)
│   ├── index.html                  # Student, Faculty & HOD interactive views
│   ├── app.js                      # Real-time WebSocket + Monaco logic
│   ├── style.css                   # Dark glassmorphic design system
│   ├── Dockerfile
│   └── README.md
└── backned/                        # REST API + Socket.IO + Sandbox Engine
    ├── src/
    │   ├── server.js               # Express & Socket.IO server entry
    │   ├── controllers/            # Session, question & attendance controllers
    │   ├── sockets/                # Real-time presence & anti-cheat handlers
    │   └── sandbox/                # Code compiler & test-case evaluation runner
    ├── Dockerfile
    └── README.md
```

---

## 🚀 How to Run the Platform

### 1. Run the Backend API & WebSocket Server
```bash
cd backned
npm install
npm start
```
* The backend server will be live at `http://localhost:5000`.

### 2. Run the Frontend Client
```bash
cd fronted
# Open index.html directly in your web browser:
start index.html
```

### 3. Or 1-Click Launch with Docker (Campus LAN / Production)
```bash
docker-compose up -d
```
* Frontend: `http://localhost:3000`
* Backend API: `http://localhost:5000`

---

## 🎯 Default Demonstration Data
* **University:** Brainware University
* **Department:** Artificial Intelligence & Machine Learning (AI & ML)
* **Section:** Section J
* **Student Name:** Aftab Sk
* **Roll No:** 538
* **Machine No:** PC-14
* **Session Code:** `BW-AIML-J-26X91`

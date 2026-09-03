# 🚀 Universal Digital Lab Backend Server

REST API, WebSocket Gateway, and Multi-Language Code Execution Sandbox for the Centralized University Digital Programming Lab.

## Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Run in development mode (with auto reload)
npm run dev

# Or run in standard mode:
npm start
```

## Environment Variables (.env)
```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/codelab_db"
JWT_SECRET="your_secure_jwt_secret_key"
```

## API Endpoints
* `GET /api/health` - Check backend status
* `POST /api/sessions/create` - Create practical session
* `GET /api/sessions/:code` - Fetch session info & question details
* `POST /api/sessions/join` - Student join session
* `GET /api/sessions/:code/grid` - Fetch live 60-machine grid state
* `POST /api/code/run` - Execute code against custom input or test cases

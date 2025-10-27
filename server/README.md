# Collaborative Whiteboard - Backend

A real-time collaborative drawing application backend built with NestJS, WebSockets (Socket.IO), and MongoDB.

## 🚀 Features

- ✨ Real-time drawing synchronization using WebSockets
- 🎨 Multi-user canvas collaboration
- 💾 Persistent canvas storage with MongoDB
- 🔒 Unique canvas ID generation
- 👥 User presence tracking
- 🧹 Canvas clearing functionality
- 📡 Room-based broadcasting

## 🛠️ Tech Stack

- **Framework**: NestJS
- **WebSocket Library**: Socket.IO
- **Database**: MongoDB with Mongoose ODM
- **Language**: TypeScript
- **Logging**: NestJS Logger

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js (v18 or higher)
- MongoDB (running locally or MongoDB Atlas account)
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
```bash
   git clone <repository-url>
   cd whiteboard-backend
```

2. **Install dependencies**
```bash
   npm install
```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
```env
   MONGODB_URI=mongodb://localhost:27017/whiteboard
   # OR for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whiteboard
   
   PORT=3000
```

4. **Start MongoDB** (if running locally)
```bash
   mongod
```

## 🏃 Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### REST API

#### Create Canvas
```http
POST /canvas
Content-Type: application/json

{
  "name": "My Canvas",
  "drawingData": []
}

Response:
{
  "data": {
    "canvasId": "a1b2c3d4",
    "name": "My Canvas",
    "drawingData": [],
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

#### Get Canvas by ID
```http
GET /canvas/:canvasId

Response:
{
  "success": true,
  "canvas": {
    "canvasId": "a1b2c3d4",
    "name": "My Canvas",
    "drawingData": [...],
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

#### Get All Canvases
```http
GET /canvas

Response:
{
  "success": true,
  "canvas": [
    {
      "canvasId": "a1b2c3d4",
      "name": "Canvas 1",
      "drawingData": [...],
      ...
    },
    ...
  ]
}
```

### WebSocket Events

#### Client → Server Events

**Join Canvas**
```javascript
socket.emit('join-canvas', { canvasId: 'a1b2c3d4' });
```

**Draw**
```javascript
socket.emit('draw', {
  points: [{ x: 100, y: 150 }, { x: 105, y: 155 }],
  color: '#000000',
  brushSize: 2,
  strokeId: 'unique-stroke-id'
});
```

**Clear Canvas**
```javascript
socket.emit('clear');
```

**Leave Canvas**
```javascript
socket.emit('leave-canvas');
```

#### Server → Client Events

**Joined Canvas**
```javascript
socket.on('joined-canvas', (data) => {
  // data: { success, canvasId, users, message }
});
```

**Drawing Data (from other users)**
```javascript
socket.on('drawing-data', (data) => {
  // data: { points, color, brushSize, strokeId, userId }
});
```

**Canvas Cleared**
```javascript
socket.on('canvas-cleared', (data) => {
  // data: { clearedBy, timestamp }
});
```

**User Joined**
```javascript
socket.on('user-joined', (data) => {
  // data: { userId, canvasId, users, message }
});
```

**User Left**
```javascript
socket.on('user-left', (data) => {
  // data: { userId, canvasId, users, message }
});
```

**Error**
```javascript
socket.on('error', (message) => {
  // Error message string
});
```

## 🗂️ Project Structure
```
whiteboard-backend/
├── src/
│   ├── canvas/
│   │   ├── canvas.controller.ts    # REST API endpoints
│   │   ├── canvas.service.ts       # Business logic
│   │   ├── canvas.module.ts        # Canvas module
│   │   └── dto/
│   │       └── canvas.dto.ts       # Data transfer objects
│   ├── schemas/
│   │   └── canvas.schema.ts        # MongoDB schema
│   ├── app.gateway.ts              # WebSocket gateway
│   ├── app.module.ts               # Root module
│   └── main.ts                     # Application entry point
├── .env                            # Environment variables
├── package.json
└── tsconfig.json
```

## 💾 Database Schema

### Canvas Document
```typescript
{
  canvasId: string;        // Unique 8-character hex ID
  name: string;            // Canvas name
  drawingData: [           // Array of strokes
    {
      points: [{ x: number, y: number }],
      color: string,
      brushSize: number
    }
  ];
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔒 Security Features

- CORS enabled for all origins (configure for production)
- Unique canvas ID generation using crypto module
- Input validation with DTOs
- Error handling and logging
- Connection state management

## 🧪 Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/whiteboard` |
| `PORT` | Server port | `3000` |

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
mongod
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### WebSocket Connection Failed
- Ensure CORS is properly configured in `app.gateway.ts`
- Check frontend is connecting to correct backend URL
- Verify firewall settings

## 🚀 Deployment

### Using PM2
```bash
npm install -g pm2
npm run build
pm2 start dist/main.js --name whiteboard-backend
```

### Using Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 📄 License

MIT

## 👨‍💻 Author

Your Name

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Support

For support, email jeremiah.anku.coblah@gmail.com or open an issue.
// Import packages
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { v4 as uuid } from "uuid";
// Import files
import connectDB from "./src/db/db.js";
import userRouter from "./src/routes/user.route.js";
import chatRouter from "./src/routes/chat.routes.js";
import seedUsers from "./src/seeders/user.seeder.js";
import {Server} from "socket.io";
import { createServer } from "http";
import { COLLABMSG, NEW_MESSAGE, NEW_MESSAGE_AlERT } from "./src/constants/events.js";
import { getSockets } from "./src/utils/socket.utils.js";
import { Message } from "./src/models/message.model.js";
;
// import { Liveblocks } from "@liveblocks/node";


import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import socketAuthMiddleware from "./src/middlewares/socket.middleware.js";
import { Authorization } from "./src/middlewares/auth.middleware.js";


import { Liveblocks } from "@liveblocks/node";
// import {createClient } from "@liveblocks/node"
// Initializations
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true,
    },
});

const liveblocks = new Liveblocks({
  secret: "sk_dev_mvprbHQ5eup9L4qGuP3LckW8PYdRDRX2FV07wszG_lLZFA-GC25SrxwCWya6Wa8p",
});

dotenv.config();


// Middleware: Enable CORS properly
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
        optionsSuccessStatus: 200,
        methods: "GET, POST, PUT, DELETE",
        allowedHeaders: "Content-Type, Authorization",
    })
);

app.use(express.json()); 
app.use(cookieParser());

socketAuthMiddleware(io);

// Database connection
connectDB()
console.log("Database going to connect.....");



// Routes
app.get("/", (req, res) => {
    res.send("Hello from Express");
});

// app.use((req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({ message: 'User not authenticated' });
//     }
//     next();
//   });  
app.post("/api/auth", async (req, res) => {
    try {
        console.log("Start")
      const { chatId, name, email, avatar } = req.body;
      console.log(chatId, name, email,avatar)
      if (!chatId || !name || !email || !avatar) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      // Create a new session with user identity and permissions
      const session = liveblocks.prepareSession(email, {
        userInfo: {
          name,
          avatar,
          color: "#00ff00", // Optional custom color
        },
        permissions: [
          {
            room: chatId,
            permissions: [
              "room:read",
              "room:write",
              "threads:read",
              "threads:write",
            ],
          },
        ],
      });
   console.log(session)
      // Optional: allow wildcards or additional access
      session.allow(`room:${chatId}`, session.FULL_ACCESS);
      session.allow(`threads:${chatId}`, session.FULL_ACCESS);
  console.log(session)
      const { status, body } = await session.authorize();
  
      console.log("Authorization status:", status);
      res.status(status).send(body);
    } catch (error) {
      console.error("Liveblocks auth error:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  
  
app.use("/user", userRouter);
app.use("/chat", chatRouter);

export const userSocketIDs = new Map();    // {socketId: roomId}   

io.on("connection",async (socket) => {
    console.log("a user connected",socket.id);

    const user = socket.user
   console.log("user : ",user);
   userSocketIDs.set(user._id.toString(),socket.id);


    socket.on(NEW_MESSAGE,async({chatId, members, message}) => {
        console.log("message : ",message);
        console.log("chatId : ",chatId);
        console.log("members : ",members);
    

     const messageForDB = {
        chat: chatId,
        content : message,
        sender : user._id,
     }

     try{
        const newMessage = new Message(messageForDB);
        await newMessage.save();
        
     const messageForRealTime = {
        chat: chatId, 
        _id : newMessage._id,
        
        content : message,
        sender : {
            _id : user._id,
            name : user.name
        },
        createdAt : new Date().toISOString()
     }
     const userSockets = getSockets(members);
     console.log("Emitting COLLABMSG to sockets:", userSockets);
    io.to(userSockets).emit(NEW_MESSAGE, {
        message:  messageForRealTime ,
        chatId,
    });
    io.to(userSockets).emit(NEW_MESSAGE_AlERT, {chatId});  

   
        
   io.emit(NEW_MESSAGE,  messageForRealTime );
    }catch(err){
        console.log(err);
        
   }

    });

// COLLABMSG event handling
socket.on(COLLABMSG, ({ content, members }) => {
    console.log("Received COLLABMSG:");
    console.log("Content:", content);
    console.log("Members:", members);

    const userSockets = getSockets(members);
    console.log("Emitting COLLABMSG to sockets:", userSockets);
    // io.to(userSockets).emit(COLLABMSG, { members, content });
    io.emit(COLLABMSG, { members, content });
    console.log("COLLABMSG emitted successfully.");
  });

    socket.on("disconnect", () => {
        console.log("user disconnected");
        userSocketIDs.delete(""+user._id);
    });
});


// Start server
const port = process.env.PORT || 8000;
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

export default {app};

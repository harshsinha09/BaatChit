import express from "express";
import { Liveblocks } from "@liveblocks/node";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const LIVEBLOCKS_SECRET_KEY = process.env.LIVEBLOCKS_SECRET_KEY;
if (!LIVEBLOCKS_SECRET_KEY) {
  throw new Error("Missing LIVEBLOCKS_SECRET_KEY in environment variables");
}

// Initialize Liveblocks with the secret key from .env
const liveblocks = new Liveblocks({
    secret: LIVEBLOCKS_SECRET_KEY,
  });

  router.post("/auth", async (req, res) => {
    const { userId, chatId, name, color, avatar } = req.body;
    
    if (!userId || !chatId) {
        return res.status(400).json({ error: "User ID and Chat ID are required" });
    }

    try {
        // Prepare Liveblocks session with user metadata
        const session = liveblocks.prepareSession(userId, {
            userInfo: {
                name: name || "Anonymous",
                color: color || "#000000",
                avatar: avatar || "https://default-avatar.com/default.png",
            },
        });

        // Grant full access to the chat room
        session.allow(chatId, session.FULL_ACCESS);

        // Authorize and return session token
        const { body, status } = await session.authorize();
        res.status(status).json(body);
    } catch (error) {
        console.error("Liveblocks Auth Error:", error);
        res.status(500).json({ error: "Failed to authorize session" });
    }
});



export default router;

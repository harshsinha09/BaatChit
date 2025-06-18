import React from "react";
import TopNavbar from "./TopNavbar";
import "./CollabChatWindow.css";
import { useParams } from "react-router-dom";
import {
  RoomProvider,
} from "@liveblocks/react/suspense";
import { Editor } from "../api/Editor.tsx";
import { ClientSideSuspense } from "@liveblocks/react";
import axios from "axios";

function CollabChatWindow() {
  const { chatId } = useParams();
  const user = {
    email: "raman@gmail.com",
    name: "Raman",
    avatar: "https://i.pravatar.cc/150?u=raman",
    color: "#fff",
  };
  return (
    <div className="collab-chat-window">
      <TopNavbar />

      {/* RoomProvider is responsible for the real-time collaboration */}
      <RoomProvider
         id={chatId}
         initialPresence={{ cursor: null }}
         resolveMentionSuggestions={async ({ text }) => {
           const response = await fetch("/api/users");
           let users = await response.json();
 
           if (text) {
             users = users.filter((user) => user.name.includes(text));
           }
 
           return users.map((user) => user.id);
         }}
         authentication={{
           endpoint: async (room) => {
             try {
               const accessToken = localStorage.getItem("accessToken");
               console.log("Access Token:", accessToken);
 
               const res = await axios.post(
                 "http://localhost:8000/api/auth",
                 {
                   chatId,
                   name: user.name,
                   email: user.email,
                   avatar: user.avatar,
                 },
                 {
                   headers: {
                     Authorization: `Bearer ${accessToken}`,
                   },
                 }
               );
 
               return res.data; // Must return a JSON object containing session data
             } catch (error) {
               console.error("Auth request failed:", error);
               throw error;
             }
           },
         }}
      >
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          <Editor />
        </ClientSideSuspense>
      </RoomProvider>
    </div>
  );
}

export default CollabChatWindow;

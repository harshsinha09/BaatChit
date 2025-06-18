import React, { createContext, useContext, useState } from "react";

// Create a context for Liveblocks
export const LiveblocksContext = createContext(null);

export const LiveblocksProvider = ({ children }) => {
  const [roomData, setRoomData] = useState(null);

  return (
    <LiveblocksContext.Provider value={{ roomData, setRoomData }}>
      {children}
    </LiveblocksContext.Provider>
  );
};

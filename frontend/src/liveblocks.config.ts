import { LiveList } from "@liveblocks/client";
import { createClient } from "@liveblocks/client";

const client = createClient({
  authEndpoint: "/api/auth", // Make sure this matches your backend
});

export default client;


// declare global {
//   interface Liveblocks {
//     // Each user's Presence, for useMyPresence, useOthers, etc.
//     Presence: {
//       // Example, real-time cursor coordinates
//       cursor: { x: number; y: number };
//     };

//     // The Storage tree for the room, for useMutation, useStorage, etc.
//     Storage: {
//       // Example, a conflict-free list
//       animals: LiveList<string>;
//     };

//     UserMeta: {
//       id: string;
//       // Custom user info set when authenticating with a secret key
//       info: {
//         // Example properties, for useSelf, useUser, useOthers, etc.
//         name: string;
//         color: string;
//         avatar: string;
//       };
//     };

//     // Custom events, for useBroadcastEvent, useEventListener
//     // Example has two events, using a union
//     RoomEvent: { type: "PLAY" } | { type: "REACTION"; emoji: "🔥" };

//     // Custom metadata set on threads, for useThreads, useCreateThread, etc.
//     ThreadMetadata: {
//       // Example, attaching coordinates to a thread
//       x: number;
//       y: number;
//     };

//     // Custom room info set with resolveRoomsInfo, for useRoomInfo
//     RoomInfo: {
//       // Example, rooms with a title and url
//       title: string;
//       url: string;
//     };

//     // Custom activities data for custom notification kinds
//     ActivitiesData: {
//       // Example, a custom $alert kind
//       $alert: {
//         title: string;
//         message: string;
//       };
//     };
//   }
// }

// // Necessary if you have no imports/exports
// export {};
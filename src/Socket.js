import { io } from "socket.io-client";

import API_URL from "./config";
const socket = io(`https://ravyn-backend.onrender.com`, {
  autoConnect: false, // important
  transports: ["websocket"],
});

export default socket;

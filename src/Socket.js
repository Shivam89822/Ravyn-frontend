import { io } from "socket.io-client";
const API_URL = import.meta.env.REACT_APP_API_URL;
const socket = io(`${API_URL}`, {
  autoConnect: false, // important
  transports: ["websocket"],
});

export default socket;

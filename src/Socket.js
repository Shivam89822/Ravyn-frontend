import { io } from "socket.io-client";

const defaultSocketUrl = "https://ravyn-backend.onrender.com";
const hostname =
  typeof window !== "undefined" ? window.location.hostname : "localhost";
const socketUrl =
  process.env.REACT_APP_SOCKET_URL || defaultSocketUrl;

if (typeof window !== "undefined") {
  console.log("[socket] URL configured", {
    socketUrl,
    envValue: process.env.REACT_APP_SOCKET_URL || null,
    hostname,
  });

  if (!process.env.REACT_APP_SOCKET_URL) {
    console.warn(
      "[socket] REACT_APP_SOCKET_URL is missing. Falling back to default deployed backend.",
      defaultSocketUrl
    );
  }
}

const socket = io(socketUrl, {
  autoConnect: false, // important
  transports: ["websocket"],
  withCredentials: true,
});

export default socket;

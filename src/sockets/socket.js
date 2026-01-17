import { io } from "socket.io-client";

const SOCKET_URL = "http://192.168.100.7:3000";

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  withCredentials: true,
  autoConnect: true
});

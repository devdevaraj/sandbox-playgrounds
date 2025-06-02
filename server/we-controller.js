import WebSocket from "ws";
import getDestination from "./utils/get-destination.js";

export default function handleProxyConnection(clientSocket, path) {
 const targetUrl = getDestination(path);
 const targetSocket = new WebSocket(targetUrl);
 targetSocket.on('open', () => {

  clientSocket.on('message', (msg) => {
   return targetSocket.send(msg.toString("utf8"))
  });
  targetSocket.on('message', (msg) => {
   return clientSocket.send(msg.toString("utf8"));
  });
 });

 targetSocket.on("error", err => {
  console.log(err);
 });

 const closeBoth = () => {
  try {
   if (clientSocket.OPEN) {
    clientSocket.close();
   }
   if (targetSocket.OPEN) {
    targetSocket.close();
   }
  } catch (error) { }
 };

 clientSocket.on('close', closeBoth);
 targetSocket.on('close', closeBoth);
 clientSocket.on('error', closeBoth);
 targetSocket.on('error', closeBoth);
}
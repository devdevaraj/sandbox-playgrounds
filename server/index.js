import http from "http";
import path from "path";
import cookieParser from "cookie-parser";
import { WebSocketServer } from 'ws';
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./router.js";
import handleProxyConnection from "./we-controller.js";
import getDestination from "./utils/get-destination.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static("./dist"));
app.use("/api/v1", router);


server.on('upgrade', async (request, socket, head) => {
 const { url } = request;

 if (!getDestination(url)) {
  socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
  socket.destroy();
  return;
 }

 wss.handleUpgrade(request, socket, head, async (ws) => {
  handleProxyConnection(ws, url);
 });
});

app.get('*path', (_, res) => res.sendFile(path.resolve('./dist/index.html')));

server.listen(process.env.PORT, err => {
 if (err) return console.log("Error starting server", err);
 console.log(`Server started on port: ${process.env.PORT}`);
});
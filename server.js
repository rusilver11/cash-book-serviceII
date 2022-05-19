import express from "express";
import route from "./app/routes/index.js";
import { Client } from "whatsapp-web.js";
import uriqrcode from "qrcode";
import helmet from "helmet";
import {Server as socketIO}  from "socket.io";
import http from "http"
import { createRequire } from "module"; // Bring in the ability to create the 'require' method
const require = createRequire(import.meta.url); // construct the require method
const {LocalAuth} = require("whatsapp-web.js");

const server = express();
const port = process.env.PORT || 3000;
const serverApp = http.createServer(server)
const io = new socketIO(serverApp);

server.use(helmet({contentSecurityPolicy:false}));
server.use(express.urlencoded({ extended: true }));
server.use(express.json());
server.use(route);

///wa

//use the saved values
export const client = new Client({
  restartOnAuthFail:true,
  puppeteer: {
    headless: true,
    ignoreHTTPSErrors: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process", // <- this one doesn't works in Windows
      "--disable-gpu",
    ],
  },
  authStrategy: new LocalAuth({})
  
});

// //socket io
io.on("connection", (socket) => {
  socket.emit("message","Connecting...");
  
  //saved session value to the file upon successful auth
  client.on("authenticated", () => {
    socket.emit('authenticated', 'Whatsapp is authenticated!');
    socket.emit('message', 'Whatsapp is authenticated!');
  });

  client.on("qr", (qr) => {
    // Generate and scan this code with your phone
    console.log("QR RECEIVED", qr);
    //qrcode.generate(qr, { small: true }); //qr Terminal
    uriqrcode.toDataURL(qr,(err,url)=>{
      socket.emit("qr",url);
      socket.emit("message","Please scan QR Code!");
    });
  });

  client.on("ready", () => {
    socket.emit("ready","WhatsApp is ready!");
    socket.emit("message","WhatsApp is ready!");
    console.log("Client is ready!");
  });
});

client.initialize();

client.on("message",msg =>{
  if(msg.body == "FienStatus") msg.reply("Ready!");
});
//endWA

//server listen
serverApp.listen(port, () => console.log("Server is now running at port", port));

export default client;




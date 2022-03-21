import express from "express";
import route from "./app/routes/index.js";
import { Client} from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import uriqrcode from "qrcode";
import helmet from "helmet";
import {sendEmail} from "./mailer.js"
import fs from "fs";
import { createRequire } from "module"; // Bring in the ability to create the 'require' method
const require = createRequire(import.meta.url); // construct the require method
const {LegacySessionAuth} = require("whatsapp-web.js");

const server = express();
const port = process.env.PORT || 3000;

server.use(helmet());
server.use(express.urlencoded({ extended: true }));
server.use(express.json());
server.use(route);


///wa
const SESSION_FILE_PATH = "./wasession.json";
let sessionData;
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionData = require(SESSION_FILE_PATH);
}

//use the saved values
export const client = new Client({
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
  authStrategy: new LegacySessionAuth({
    session:sessionData,
    restartOnAuthFail:true
  })
  
});

//saved session value to the file upon successful auth
client.on("authenticated", async(session) => {
  sessionData = session;
  fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
    if (err) console.error(err);
  });
});

client.on("qr", async(qr) => {
  // Generate and scan this code with your phone
  console.log("QR RECEIVED", qr);
  qrcode.generate(qr, { small: true });
  uriqrcode.toFile('./qrimages/atcqr.png',qr,{
    color: {
      dark:"#010599FF",
      light:"#FFBF60FF"
    }
  },function (err) {
    if (err) throw err
    console.log('done')
  })
  sendEmail();
  
});

client.on("ready", async() => {
  console.log("Client is ready!");
  //server listen
  server.listen(port, () => console.log("Server is now running at port", port));
});

client.initialize()

export default client;
//endwa

server.get("/", (req, res) => {
  res.send("Service API");
});


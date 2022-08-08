import nodemailer from "nodemailer";
import { createRequire } from "module"; // Bring in the ability to create the 'require' method
const require = createRequire(import.meta.url); // construct the require method
require("dotenv").config();

export const sendEmail = async () =>{

    const userEmail = process.env.EMAIL_USER_BUSINESS;
    const passwordEmail = process.env.EMAIL_PASSWORD_BUSINESS;
    const clientdEmail = process.env.EMAIL_CLIENT_BUSINESS;

    let transaporter =  nodemailer.createTransport({
        service: "gmail",
        auth: {
            user : userEmail,
            pass : passwordEmail,
        }
    });

    let mailOptions = {
        from : userEmail,
        to : clientdEmail,
        subject : "Sending QR Images NodeJs",
        attachments: [{
            path: "./qrimages/atcqr.png"
        }]
    };

    transaporter.sendMail(mailOptions,(error,info)=>{
        if(error){
            throw new Error(error);
        }else{
            console.log("Email send : ",info.response);
        }
    })

}

export default sendEmail;
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

transporter.sendMail(
  {
    from: process.env.GMAIL_USER,
    to: "your-other-email@gmail.com",
    subject: "Test email",
    text: "This is a test",
  },
  (err, info) => {
    if (err) console.log("Error:", err);
    else console.log("Email sent:", info.response);
  }
);

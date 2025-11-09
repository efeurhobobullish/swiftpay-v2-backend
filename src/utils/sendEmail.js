import nodemailer from "nodemailer";
import process from "process";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });


  const sendEmail = async (to, subject, html) => {
    const mailOptions = {
        from:`"Jackson from Questpay" <${process.env.EMAIL}>`,
        to,
        subject,
        html,
    };
    await transporter.sendMail(mailOptions);
  };

  export default sendEmail;
  
import nodemailer from "nodemailer";
// Create transporter

async function sendEmail(email:string,link:string , userId?:string, ) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_ID,
      pass: process.env.MAIL_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.MAIL_ID,
    to: email,
    subject: "Email Verification at Fasco",
    text: "This is a test email",
    html: `<b>This is a test email</b><br><a href="${link}">Verify Email</a>`,
  });

  console.log("Message sent:", info.messageId);
}

export { sendEmail };
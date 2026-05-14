import nodemailer from "nodemailer";
// Create transporter

async function sendEmail(
  email: string,
  link: string,
  userId?: string,
  options?: { subject?: string; actionText?: string }
) {
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
    subject: options?.subject ?? "Email Verification at Fasco",
    text: `${options?.actionText ?? "Verify Email"} link: ${link}`,
    html: `<b>${options?.subject ?? "Email Verification at Fasco"}</b><br><a href="${link}">${options?.actionText ?? "Verify Email"}</a>`,
  });

  console.log("Message sent:", info.messageId);
}

export { sendEmail };
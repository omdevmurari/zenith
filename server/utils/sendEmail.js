import nodemailer from "nodemailer";

const getTransportConfig = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be configured.");
  }

  if (process.env.EMAIL_SERVICE) {
    return {
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };
  }

  return {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };
};

export const sendEmail = async ({ email, subject, message }) => {
  const transporter = nodemailer.createTransport(getTransportConfig());

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `Zenith Support <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    text: message,
  });
};


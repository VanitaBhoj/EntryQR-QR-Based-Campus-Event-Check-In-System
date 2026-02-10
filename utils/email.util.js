import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendQRMail = async ({ to, name, qrImage }) => {
  await transporter.sendMail({
    from: `"QR Check-in" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Event QR Code",
    html: `
      <h3>Hello ${name}</h3>
      <p>Show this QR code at event entry</p>
      <img src="${qrImage}" />
    `
  });
};

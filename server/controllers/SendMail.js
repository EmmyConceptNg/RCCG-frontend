import nodemailer from "nodemailer";

export const sendMail = (receiver, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.ADMIN_MAIL,
      pass: process.env.ADMIN_MAIL_PASS,
    },
    // logger: true, // Enable debugging
    // debug: true, // More detailed debugging info
  });

  // console.log(process.env.ADMIN_MAIL);
  // Setup email data
  const mailOptions = {
    from: process.env.ADMIN_MAIL,
    to: receiver,
    subject: subject,
    html: html,
  };

  // Send email
  return new Promise((resolve, reject) => {
    transporter
      .sendMail(mailOptions)
      .then((info) => {
        console.log("Email sent:", info.response);
        resolve(info.response); // Resolve with email information
      })
      .catch((error) => {
        console.error("Error sending email:", error);
        reject(error); // Reject with error
      });
  });
};
export const sendAttachedMail = (receiver, subject, text, pdfBuffer) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.ADMIN_MAIL,
      pass: process.env.ADMIN_MAIL_PASS,
    },
    // logger: true, // Enable debugging
    // debug: true, // More detailed debugging info
  });

  // console.log(process.env.ADMIN_MAIL);
  // Setup email data
  const mailOptions = {
    from: process.env.ADMIN_MAIL,
    to: receiver,
    subject: subject,
    text: text,
    attachments: [
      {
        filename: "invoice.pdf",
        content: pdfBuffer,
      },
    ],
  };

  // Send email
  return new Promise((resolve, reject) => {
    transporter
      .sendMail(mailOptions)
      .then((info) => {
        console.log("Email sent:", info.response);
        resolve(info.response); // Resolve with email information
      })
      .catch((error) => {
        console.error("Error sending email:", error);
        reject(error); // Reject with error
      });
  });
};

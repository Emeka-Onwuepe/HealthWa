// import { createTransport } from 'nodemailer';
// import dotenv from 'dotenv';

// dotenv.config();

// // Replace with your Namecheap hosting SMTP details
// const transporter = createTransport({
//     host: process.env.EMAIL_HOST, // e.g., mail.example.com
//     port: process.env.EMAIL_PORT, // or 587 for TLS
//     secure: true, // true for port 465, false for 587
//     auth: {
//         user: process.env.EMAIL_USER, // your Namecheap email address
//         pass: process.env.EMAIL_PASS, // your email password
//     },
// });


// export default async function sendEmail(to, subject, text, html) {
//     const mailOptions = {
//         from: '"Info"<info@lotzcrocoz.com>', // sender address
//         to, // recipient
//         subject,
//         text,
//         html,
//     };

//     try {
//         const info = await transporter.sendMail(mailOptions);
//         console.log('Email sent:', info.messageId);
//         return info;
//     } catch (error) {
//         console.error('Error sending email:', error);
//         throw error;
//     }
// }



// // Example usage:
// // sendEmail('recipient@example.com', 'Test Subject', 'Hello world!', '<b>Hello world!</b>');

// // export default { sendEmail };
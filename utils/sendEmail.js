const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Create a transporter
    // (Replace these with your actual SMTP credentials in your .env file)
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
        port: process.env.EMAIL_PORT || 2525,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // 2. Define the email options
    const mailOptions = {
        from: '"After Commerce" <noreply@aftercommerce.com>',
        to: options.email,
        subject: options.subject,
        html: options.html // We use HTML so we can send beautiful formatted emails
    };

    // 3. Send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
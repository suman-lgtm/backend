const nodemailer = require("nodemailer");

const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"A2Z" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP for A2Z",
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica,
       Arial, sans-serif; background-color: #f4f4f7; padding: 40px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          
          <!-- Header with teal gradient -->
          <div style="
            background: linear-gradient(90deg, #00c6ae, #008080);
            color: #ffffff;
            padding: 20px;
            text-align: center;
          ">
            <h1 style="margin:0; font-size: 24px;">A2Z</h1>
          </div>
          
          <div style="padding: 30px; color: #333;">
            <p style="font-size: 16px;">Hi there,</p>
            <p style="font-size: 16px;">Thank you for registering on <strong>A2Z</strong>. Use the OTP below to verify your email address:</p>
            
            <!-- OTP box with teal gradient -->
            <div style="text-align: center; margin: 30px 0;">
              <span style="
                display: inline-block;
                font-size: 24px;
                letter-spacing: 4px;
                padding: 15px 25px;
                background: linear-gradient(90deg, #00c6ae, #008080);
                color: #ffffff;
                font-weight: bold;
                border-radius: 6px;
              ">${otp}</span>
            </div>
            
            <p style="font-size: 14px; color: #555;">This OTP will expire in <strong>5 minutes</strong>. Do not share it with anyone.</p>
            <p style="font-size: 14px; color: #555;">If you did not register, simply ignore this email.</p>
            
            <p style="margin-top: 40px; font-size: 12px; color: #999; text-align: center;">
              &copy; ${new Date().getFullYear()} A2Z. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOTPEmail;

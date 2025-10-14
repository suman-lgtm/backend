const nodemailer = require("nodemailer");

const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // use app password or OAuth2 in production
    },
  });

  const mailOptions = {
    from: `"A2Zinsure Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your A2Zinsure password reset code",
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.08);">
          
          <!-- Header with blue gradient (bg-blue-600) -->
          <div style="
            background: linear-gradient(90deg, #2563EB 0%, #1E40AF 100%);
            color: #ffffff;
            padding: 20px;
            text-align: center;
          ">
            <h1 style="margin:0; font-size: 24px;">A2Zinsure</h1>
            <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Password reset</p>
          </div>
          
          <div style="padding: 30px; color: #333;">
            <p style="font-size: 16px;">Hi,</p>
            <p style="font-size: 16px;">We received a request to reset the password for your A2Zinsure account. Use the code below to reset your password:</p>
            
            <!-- OTP box with blue gradient -->
            <div style="text-align: center; margin: 30px 0;">
              <span style="
                display: inline-block;
                font-size: 24px;
                letter-spacing: 6px;
                padding: 15px 28px;
                background: linear-gradient(90deg, #2563EB, #1E40AF);
                color: #ffffff;
                font-weight: 700;
                border-radius: 6px;
                box-shadow: 0 6px 18px rgba(37,99,235,0.18);
              ">${otp}</span>
            </div>
            
            <p style="font-size: 14px; color: #555;">
              This password reset code will expire in <strong>5 minutes</strong>. Do not share it with anyone.
            </p>

            <p style="font-size: 14px; color: #555;">
              If you did not request a password reset, you can safely ignore this email.
            </p>
            
            <hr style="border:none; border-top:1px solid #eef2ff; margin: 28px 0;">

            <p style="margin-top: 10px; font-size: 12px; color: #888; text-align: center;">
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

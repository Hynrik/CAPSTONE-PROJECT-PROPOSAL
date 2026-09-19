import nodemailer from "nodemailer";

export const sendOtpEmail = async (to: string, otp: string) => {
  const transportOptions = {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
  };

    // Render may not have IPv6 connectivity.
  Object.assign(transportOptions, { family: 4 });

  const transporter = nodemailer.createTransport(transportOptions);

  await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "AIPGEF OTP Verification",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
        <h2 style="margin-bottom: 12px; color: #111827;">Your OTP code</h2>
        <p style="margin: 0 0 16px; color: #374151;">Use the code below to verify your login.</p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #111827; background: #f3f4f6; padding: 18px 16px; border-radius: 10px; text-align: center;">
          ${otp}
        </div>
        <p style="margin-top: 16px; color: #6b7280;">This code expires in 5 minutes.</p>
      </div>
    `,
  });
};

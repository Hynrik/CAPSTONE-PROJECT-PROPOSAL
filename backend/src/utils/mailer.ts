import nodemailer from "nodemailer";

export const sendOtpEmail = async (to: string, otp: string) => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const secure =
    process.env.SMTP_SECURE?.toLowerCase() === "true" || port === 465;

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error(
      "SMTP_USER and SMTP_PASS must be configured in the backend environment"
    );
  }

  const transportOptions = {
    host,
    port,
    secure,
    requireTLS: !secure,
    family: 4,
    auth: {
      user,
      pass,
    },
  };

  const transporter = nodemailer.createTransport(transportOptions);

  await transporter.sendMail({
    from: process.env.SMTP_FROM || user,
    to,
    subject: "AIPGEF OTP Verification",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
        <h2 style="margin-bottom: 12px; color: #111827;">Your OTP code</h2>
        <p style="margin: 0 0 16px; color: #374151;">Use the code below to verify your login.</p>

        <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #111827; background: #f3f4f6; padding: 18px 16px; border-radius: 10px; text-align: center;">
          ${otp}
        </div>

        <p style="margin-top: 16px; color: #6b7280;">
          This code expires in 5 minutes.
        </p>
      </div>
    `,
  });
};
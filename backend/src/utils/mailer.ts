import nodemailer from "nodemailer";

export const sendOtpEmail = async (to: string, otp: string) => {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const username = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASS?.trim();
  const from = process.env.SMTP_FROM?.trim() || username;
  const secure = process.env.SMTP_SECURE?.toLowerCase() === "true" || port === 465;

  if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !username || !password || !from) {
    throw new Error(
      "SMTP configuration is invalid. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM."
    );
  }

  if (!to || !to.includes("@")) {
    throw new Error("The user account does not have a valid email address.");
  }

  const transportOptions = {
    host,
    port,
    secure,
    requireTLS: !secure && port === 587,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
    tls: {
      minVersion: "TLSv1.2" as const,
    },
    auth: {
      user: username,
      pass: password,
    },
  };

  // Render may not have IPv6 connectivity; Nodemailer passes this to Node's socket.
  Object.assign(transportOptions, { family: 4 });

  const transporter = nodemailer.createTransport(transportOptions);

  await transporter.sendMail({
    from,
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

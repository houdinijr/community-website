import nodemailer from "nodemailer";

function getNotificationRecipient() {
  return process.env.NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || null;
}

function getMailerConfig() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user || getNotificationRecipient();

  if (!host || !port || !user || !pass || !from) {
    return null;
  }

  return {
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    from,
  };
}

export async function sendSiteNotification(input: {
  subject: string;
  message: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}) {
  const recipient = getNotificationRecipient();
  const config = getMailerConfig();
  if (!config || !recipient) {
    return { delivered: false, reason: "smtp_not_configured" as const };
  }

  void (async () => {
    try {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: config.auth,
        connectionTimeout: 1500,
        greetingTimeout: 1500,
        socketTimeout: 1500,
      });

      const lines = [input.message];

      if (input.metadata) {
        lines.push("", "Metadata:");
        for (const [key, value] of Object.entries(input.metadata)) {
          lines.push(`- ${key}: ${value ?? ""}`);
        }
      }

      await transporter.sendMail({
        from: config.from,
        to: recipient,
        subject: input.subject,
        text: lines.join("\n"),
      });
    } catch {
      // Intentionally ignored to keep notifications non-blocking in production.
    }
  })();

  return { delivered: true as const, reason: "queued" as const };
}

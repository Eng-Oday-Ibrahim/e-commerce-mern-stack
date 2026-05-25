import { randomBytes } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

type EmailInput = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

function isTruthy(v: string | undefined | null): v is string {
  return !!v && v.trim().length > 0;
}

function redactEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!user || !domain) return 'redacted';
  const keep = user.length <= 2 ? 1 : 2;
  return `${user.slice(0, keep)}***@${domain}`;
}

async function writeOutbox(entry: EmailInput): Promise<void> {
  const outboxDir =
    process.env.EMAIL_OUTBOX_DIR ||
    path.join(process.cwd(), 'storage', 'emails');

  try {
    await mkdir(outboxDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const rand = randomBytes(6).toString('hex');
    const filename = `${stamp}-${rand}.json`;
    await writeFile(
      path.join(outboxDir, filename),
      JSON.stringify(
        {
          ...entry,
          to: redactEmail(entry.to),
        },
        null,
        2
      ),
      'utf8'
    );
  } catch {
    // ignore outbox failures
  }
}

let transporterPromise: Promise<any> | null = null;

async function getTransporter(): Promise<any | null> {
  const host = process.env.SMTP_HOST;
  const portRaw = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!isTruthy(host) || !isTruthy(portRaw) || !isTruthy(user) || !isTruthy(pass)) {
    return null;
  }

  if (!transporterPromise) {
    transporterPromise = (async () => {
      // nodemailer is a runtime dependency; keep it lazy so dev can run without SMTP.
      const mod: any = await import('nodemailer');
      const createTransport =
        mod?.createTransport ?? mod?.default?.createTransport;
      if (typeof createTransport !== 'function') {
        throw new Error('nodemailer createTransport not found');
      }

      const port = Number(portRaw);
      const secure = port === 465;
      return createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });
    })();
  }

  return transporterPromise;
}

export async function sendEmail(input: EmailInput): Promise<{ ok: boolean }> {
  await writeOutbox(input);

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  let transporter: any | null = null;
  try {
    transporter = await getTransporter();
  } catch (err) {
    console.error('[Email] Transport init failed:', (err as Error).message);
    transporter = null;
  }

  if (!transporter || !isTruthy(from)) {
    console.log('[Email] Skipped (SMTP not configured):', {
      to: redactEmail(input.to),
      subject: input.subject,
    });
    return { ok: false };
  }

  try {
    await transporter.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
    console.log('[Email] Sent:', { to: redactEmail(input.to), subject: input.subject });
    return { ok: true };
  } catch (err) {
    console.error('[Email] Send failed:', (err as Error).message);
    return { ok: false };
  }
}

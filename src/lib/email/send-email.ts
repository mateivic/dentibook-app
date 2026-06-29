import "server-only";

// Generic transactional email transport over the Brevo HTTP API. No domain
// knowledge — callers pass fully-rendered HTML. Deliberately reusable so other
// flows (booking confirmation, cancellation, future "1 day before" reminders)
// can share one sender.
//
// Auth is key-based: an outbound fetch to api.brevo.com carrying BREVO_API_KEY.
// The sender address is fixed (BREVO_SENDER_EMAIL, a verified Brevo sender);
// only the display name varies per call (e.g. the clinic name).

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface SendEmailParams {
  to: EmailAddress;
  subject: string;
  html: string;
  senderName: string;
  replyTo?: EmailAddress;
}

export type SendEmailResult =
  | { ok: true; messageId?: string }
  | { ok: false; error: string };

export async function sendEmail(
  params: SendEmailParams,
): Promise<SendEmailResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!apiKey || !senderEmail) {
    const error =
      "BREVO_API_KEY and BREVO_SENDER_EMAIL must be configured to send email";
    console.error(`[sendEmail] ${error}`);
    return { ok: false, error };
  }

  const body = {
    sender: { email: senderEmail, name: params.senderName },
    to: [{ email: params.to.email, name: params.to.name }],
    subject: params.subject,
    htmlContent: params.html,
    ...(params.replyTo ? { replyTo: params.replyTo } : {}),
  };

  let resp: Response;
  try {
    resp = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error("[sendEmail] request to Brevo failed:", err);
    return { ok: false, error: "Email request failed" };
  }

  if (!resp.ok) {
    const detail = await resp.text().catch(() => "");
    console.error(
      `[sendEmail] Brevo returned ${resp.status} ${resp.statusText}: ${detail}`,
    );
    return { ok: false, error: `Brevo responded ${resp.status}` };
  }

  const data = (await resp.json().catch(() => ({}))) as { messageId?: string };
  return { ok: true, messageId: data.messageId };
}

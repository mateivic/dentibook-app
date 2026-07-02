import "server-only";

// Generic transactional SMS transport over the Brevo HTTP API — the SMS sibling
// of `lib/email/send-email.ts`. No domain knowledge: callers pass an E.164
// recipient, a sender id, and the final text. Reuses BREVO_API_KEY (the same key
// powers transactional email and SMS).
//
// Note: Brevo transactional SMS is a separate paid product (needs SMS credits and
// a registered sender). Missing key / no credits degrade to a logged no-op so a
// reminder run never fails because of SMS.

const BREVO_SMS_ENDPOINT = "https://api.brevo.com/v3/transactionalSMS/sms";

export interface SendSmsParams {
  // Alphanumeric sender id (<= 11 chars) or a numeric sender.
  sender: string;
  // Recipient in E.164 (e.g. "+385915551234").
  recipient: string;
  content: string;
}

export type SendSmsResult =
  | { ok: true; messageId?: string }
  | { ok: false; error: string };

export async function sendSms(params: SendSmsParams): Promise<SendSmsResult> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    const error = "BREVO_API_KEY must be configured to send SMS";
    console.error(`[sendSms] ${error}`);
    return { ok: false, error };
  }

  const body = {
    sender: params.sender,
    recipient: params.recipient,
    content: params.content,
    type: "transactional",
  };

  let resp: Response;
  try {
    resp = await fetch(BREVO_SMS_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error("[sendSms] request to Brevo failed:", err);
    return { ok: false, error: "SMS request failed" };
  }

  if (!resp.ok) {
    const detail = await resp.text().catch(() => "");
    console.error(
      `[sendSms] Brevo returned ${resp.status} ${resp.statusText}: ${detail}`,
    );
    return { ok: false, error: `Brevo responded ${resp.status}` };
  }

  const data = (await resp.json().catch(() => ({}))) as {
    messageId?: string | number;
  };
  return {
    ok: true,
    messageId: data.messageId != null ? String(data.messageId) : undefined,
  };
}

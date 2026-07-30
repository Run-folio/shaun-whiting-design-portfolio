type EasyTEmail = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

/** Send a transactional email through Resend without exposing provider details to callers. */
export async function sendEasyTEmail(email: EasyTEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    throw new Error("Transactional email is not configured. Add RESEND_API_KEY and EMAIL_FROM.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: email.to, subject: email.subject, text: email.text, html: email.html }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Email delivery failed (${response.status})${detail ? `: ${detail}` : ""}`);
  }
}

export function emailButton(url: string, label: string) {
  return `<p><a href="${url}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#17152f;color:#fff;text-decoration:none;font-weight:700">${label}</a></p>`;
}

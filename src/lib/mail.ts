type MailInput = { to: string; subject: string; text: string };

/**
 * E-posta gönderir. RESEND_API_KEY tanımlıysa gerçek mail atar;
 * tanımlı değilse (dev) içeriği sunucu konsoluna yazar.
 * Production'a geçince sadece .env'e anahtar eklemek yeterli.
 */
export async function sendMail({ to, subject, text }: MailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM ?? "VipDrive <onboarding@resend.dev>";

  if (apiKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, text }),
    });
    if (!res.ok) {
      console.error("[VipDrive MAIL] Gönderim başarısız:", await res.text());
    }
    return;
  }

  console.log(
    `\n──────── VipDrive MAIL (DEV) ────────\nKime : ${to}\nKonu : ${subject}\n${text}\n─────────────────────────────────────\n`,
  );
}

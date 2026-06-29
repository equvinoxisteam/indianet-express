import { sendMail, isMailConfigured, getMailProvider } from './mailTransport.js'

export { isMailConfigured, getMailProvider }

/**
 * Send HTML + plain-text email via Gmail (MAIL_USER / MAIL_PASS app password).
 */
export async function sendTemplatedMail({ to, subject, text, html, from }) {
    if (!to) return false
    if (!isMailConfigured()) {
        console.warn('[mail] Skipped (MAIL_USER/MAIL_PASS not set):', subject)
        return false
    }

    try {
        await sendMail({
            from: from || process.env.MAIL_FROM || `Indianet Express <${process.env.MAIL_USER || process.env.GMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        })
        return true
    } catch (err) {
        const provider = getMailProvider()
        console.error('[mail] Send failed:', subject, `(${provider})`, err?.message || err)
        return false
    }
}

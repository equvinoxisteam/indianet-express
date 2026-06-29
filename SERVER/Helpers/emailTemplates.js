const BRAND = 'Indianet Express'
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || process.env.ADMIN_MAIL || 'team@equvinoxis.com'
const ACCENT = '#0f253d'
const ACCENT_LIGHT = '#1a4a6e'

function baseLayout({ title, preview, bodyHtml }) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f2937;">
  <span style="display:none;max-height:0;overflow:hidden;">${preview}</span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f8;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(15,37,61,0.08);">
          <tr>
            <td style="background:linear-gradient(120deg,${ACCENT} 0%,${ACCENT_LIGHT} 100%);padding:24px 28px;">
              <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">${BRAND}</div>
              <div style="font-size:13px;color:rgba(255,255,255,0.85);margin-top:4px;">B2B marketplace</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 24px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;line-height:1.5;">
              This is an automated message from ${BRAND}. If you did not request this, you can ignore this email.
              <br />Need help? Contact <a href="mailto:${SUPPORT_EMAIL}" style="color:${ACCENT_LIGHT};">${SUPPORT_EMAIL}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function otpBlock(otp, label = 'Your verification code') {
    return `
      <p style="margin:0 0 8px;font-size:14px;color:#4b5563;">${label}</p>
      <div style="display:inline-block;font-size:32px;font-weight:700;letter-spacing:8px;color:${ACCENT};background:#f0f4f8;border-radius:8px;padding:14px 22px;margin:8px 0 16px;">${otp}</div>
      <p style="margin:0;font-size:13px;color:#6b7280;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
    `
}

export function userSignupOtp({ otp, name }) {
    const greeting = name ? `Hi ${name},` : 'Hi,'
    const html = baseLayout({
        title: `${BRAND} – Verify your email`,
        preview: `Your signup verification code is ${otp}`,
        bodyHtml: `
          <h1 style="margin:0 0 12px;font-size:20px;color:${ACCENT};">Verify your buyer account</h1>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#374151;">${greeting}<br />Use the code below to complete your registration on ${BRAND}.</p>
          ${otpBlock(otp, 'Signup verification code')}
        `,
    })
    const text = `${BRAND} signup verification code: ${otp}\nExpires in 10 minutes.`
    return { html, text, subject: `${BRAND} – Verify your email` }
}

export function userForgotOtp({ otp, name }) {
    const greeting = name ? `Hi ${name},` : 'Hi,'
    const html = baseLayout({
        title: `${BRAND} – Reset your password`,
        preview: `Your password reset code is ${otp}`,
        bodyHtml: `
          <h1 style="margin:0 0 12px;font-size:20px;color:${ACCENT};">Reset your password</h1>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#374151;">${greeting}<br />We received a request to reset your ${BRAND} account password.</p>
          ${otpBlock(otp, 'Password reset code')}
        `,
    })
    const text = `${BRAND} password reset code: ${otp}\nExpires in 10 minutes.`
    return { html, text, subject: `${BRAND} – Reset your password` }
}

export function vendorLoginOtp({ otp, email }) {
    const html = baseLayout({
        title: `${BRAND} – Vendor login code`,
        preview: `Your vendor login code is ${otp}`,
        bodyHtml: `
          <h1 style="margin:0 0 12px;font-size:20px;color:${ACCENT};">Vendor dashboard login</h1>
          <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#374151;">
            Sign in requested for <strong>${email}</strong>.
          </p>
          <p style="margin:0 0 20px;font-size:14px;color:#6b7280;">Enter this one-time code on the vendor login page.</p>
          ${otpBlock(otp, 'Vendor login code')}
        `,
    })
    const text = `${BRAND} vendor login code for ${email}: ${otp}\nExpires in 10 minutes.`
    return { html, text, subject: `${BRAND} – Vendor login code` }
}

export function adminLoginAlert({ email, loginTime }) {
    const time = loginTime || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    const html = baseLayout({
        title: `${BRAND} – Admin login alert`,
        preview: `Admin login for ${email}`,
        bodyHtml: `
          <h1 style="margin:0 0 12px;font-size:20px;color:${ACCENT};">Admin login detected</h1>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
            A successful login to the <strong>${BRAND} admin panel</strong> was recorded.
          </p>
          <table role="presentation" width="100%" style="background:#f9fafb;border-radius:8px;padding:12px;font-size:14px;">
            <tr><td style="padding:4px 0;color:#6b7280;">Account</td><td style="padding:4px 0;font-weight:600;">${email}</td></tr>
            <tr><td style="padding:4px 0;color:#6b7280;">Time (IST)</td><td style="padding:4px 0;">${time}</td></tr>
          </table>
          <p style="margin:16px 0 0;font-size:13px;color:#b45309;">If this was not you, change your admin password immediately.</p>
        `,
    })
    const text = `Admin login for ${email} at ${time}`
    return { html, text, subject: `${BRAND} – Admin login alert` }
}

export function adminWelcome({ email }) {
    const panelUrl = process.env.CLIENT_URL ? `${process.env.CLIENT_URL.replace(/\/$/, '')}/admin/login` : '/admin/login'
    const html = baseLayout({
        title: `${BRAND} – Admin account ready`,
        preview: 'Your admin dashboard is configured',
        bodyHtml: `
          <h1 style="margin:0 0 12px;font-size:20px;color:${ACCENT};">Admin account ready</h1>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
            Your ${BRAND} administrator account <strong>${email}</strong> is active.
          </p>
          <p style="margin:0 0 20px;font-size:14px;color:#6b7280;">Sign in with the password set in your server environment (<code>ADMIN_PASSWORD</code>).</p>
          <a href="${panelUrl}" style="display:inline-block;background:${ACCENT};color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:999px;">Open admin panel</a>
        `,
    })
    const text = `Admin account ${email} is ready. Login at ${panelUrl}`
    return { html, text, subject: `${BRAND} – Admin account ready` }
}

export function adminNewRfq({ userName, userEmail, userNumber, productName, quantity, message }) {
    const html = baseLayout({
        title: `${BRAND} – New RFQ`,
        preview: `New RFQ from ${userName}`,
        bodyHtml: `
          <h1 style="margin:0 0 12px;font-size:20px;color:${ACCENT};">New buyer RFQ</h1>
          <table role="presentation" width="100%" style="font-size:14px;line-height:1.7;">
            <tr><td style="color:#6b7280;width:120px;">Customer</td><td><strong>${userName}</strong></td></tr>
            <tr><td style="color:#6b7280;">Email</td><td>${userEmail}</td></tr>
            <tr><td style="color:#6b7280;">Phone</td><td>${userNumber || '—'}</td></tr>
            <tr><td style="color:#6b7280;">Product</td><td>${productName}</td></tr>
            <tr><td style="color:#6b7280;">Quantity</td><td>${quantity}</td></tr>
            <tr><td style="color:#6b7280;vertical-align:top;">Message</td><td>${message || '—'}</td></tr>
          </table>
        `,
    })
    const text = `New RFQ from ${userName} (${userEmail}) for ${productName}, qty ${quantity}`
    return { html, text, subject: `${BRAND} – New RFQ request` }
}

export function adminPlanRequest(details) {
    const html = baseLayout({
        title: `${BRAND} – Plan request`,
        preview: `Plan request: ${details.plan}`,
        bodyHtml: `
          <h1 style="margin:0 0 12px;font-size:20px;color:${ACCENT};">Vendor plan request</h1>
          <table role="presentation" width="100%" style="font-size:14px;line-height:1.7;">
            <tr><td style="color:#6b7280;width:120px;">Name</td><td>${details.name || '—'}</td></tr>
            <tr><td style="color:#6b7280;">Email</td><td>${details.email || '—'}</td></tr>
            <tr><td style="color:#6b7280;">Phone</td><td>${details.phone || '—'}</td></tr>
            <tr><td style="color:#6b7280;">Company</td><td>${details.company || '—'}</td></tr>
            <tr><td style="color:#6b7280;">Plan</td><td><strong>${details.plan || '—'}</strong></td></tr>
            <tr><td style="color:#6b7280;">Price</td><td>${details.price || '—'} ${details.currency || ''}</td></tr>
          </table>
        `,
    })
    const text = `Plan request: ${details.plan} from ${details.name} (${details.email})`
    return { html, text, subject: `${BRAND} – Vendor plan request: ${details.plan}` }
}

export function vendorPlanExpiryWarning({ name, planLabel, expiresAt }) {
    const expiryStr = expiresAt ? new Date(expiresAt).toLocaleString('en-IN') : 'soon'
    const html = baseLayout({
        title: `${BRAND} – Plan expiring soon`,
        preview: `Your ${planLabel} plan expires within 24 hours`,
        bodyHtml: `
          <h1 style="margin:0 0 12px;font-size:20px;color:${ACCENT};">Plan expiring soon</h1>
          <p style="margin:0 0 12px;font-size:14px;line-height:1.7;">
            Hi ${name || 'Vendor'}, your <strong>${planLabel}</strong> plan on ${BRAND} expires on <strong>${expiryStr}</strong>.
          </p>
          <p style="margin:0;font-size:14px;color:#6b7280;">
            Renew or upgrade from your vendor dashboard to avoid automatic downgrade to the Free plan.
          </p>
        `,
    })
    const text = `Your ${planLabel} plan expires on ${expiryStr}. Renew from the vendor Plans page.`
    return { html, text, subject: `${BRAND} – Your plan expires within 24 hours` }
}

export function vendorPlanExpired({ name, planLabel }) {
    const html = baseLayout({
        title: `${BRAND} – Plan ended`,
        preview: `Your ${planLabel} plan has ended`,
        bodyHtml: `
          <h1 style="margin:0 0 12px;font-size:20px;color:${ACCENT};">Plan ended</h1>
          <p style="margin:0 0 12px;font-size:14px;line-height:1.7;">
            Hi ${name || 'Vendor'}, your <strong>${planLabel}</strong> plan on ${BRAND} has ended and your account was moved to the <strong>Free</strong> plan.
          </p>
          <p style="margin:0;font-size:14px;color:#6b7280;">
            Request a new plan from the vendor dashboard to restore paid features.
          </p>
        `,
    })
    const text = `Your ${planLabel} plan has ended. You are now on the Free plan.`
    return { html, text, subject: `${BRAND} – Your paid plan has ended` }
}

export function orderPlaced({ customerName, orderId, items, totalAmount, payType, address }) {
    const lines = (items || []).map((it) =>
        `<tr><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;">${it.proName || 'Product'}</td>
         <td style="padding:6px 8px;border-bottom:1px solid #f1f5f9;text-align:center;">${it.quantity || 1}</td>
         <td style="padding:6px 0;border-bottom:1px solid #f1f5f9;text-align:right;">₹${it.price ?? it.selling_price ?? '—'}</td></tr>`
    ).join('')
    const addr = address ? `${address.address || ''}, ${address.locality || ''}, ${address.city || ''} - ${address.pin || ''}` : '—'
    const html = baseLayout({
        title: `${BRAND} – Order confirmed`,
        preview: `Order ${orderId} confirmed`,
        bodyHtml: `
          <h1 style="margin:0 0 12px;font-size:20px;color:${ACCENT};">Thank you for your order</h1>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Hi ${customerName || 'there'}, your order <strong>#${orderId}</strong> is confirmed and being processed.</p>
          <table role="presentation" width="100%" style="font-size:14px;margin-bottom:16px;">
            <tr style="font-weight:600;color:#6b7280;"><td>Product</td><td style="text-align:center;">Qty</td><td style="text-align:right;">Price</td></tr>
            ${lines}
          </table>
          <p style="margin:0 0 8px;font-size:14px;"><strong>Payment:</strong> ${payType === 'online' ? 'Paid online (Razorpay)' : 'Cash on delivery'}</p>
          <p style="margin:0 0 8px;font-size:14px;"><strong>Total:</strong> ₹${totalAmount ?? '—'}</p>
          <p style="margin:0 0 16px;font-size:14px;"><strong>Ship to:</strong> ${addr}</p>
          <p style="margin:0;font-size:13px;color:#6b7280;">Track your order anytime from My Orders on ${BRAND}.</p>
        `,
    })
    const text = `Order #${orderId} confirmed. Total ₹${totalAmount}. Payment: ${payType}.`
    return { html, text, subject: `${BRAND} – Order confirmed #${orderId}` }
}

export function orderStatusUpdate({ customerName, orderId, productName, status, trackUrl }) {
    const statusLabels = {
        Pending: 'received and pending processing',
        Processing: 'being processed',
        Shipped: 'shipped',
        'In Transit': 'in transit',
        'Out For Delivery': 'out for delivery',
        Delivered: 'delivered',
        Cancelled: 'cancelled',
    }
    const label = statusLabels[status] || status
    const trackLink = trackUrl
        ? `<p style="margin:16px 0 0;"><a href="${trackUrl}" style="color:${ACCENT_LIGHT};font-weight:600;">Track shipment</a></p>`
        : ''
    const html = baseLayout({
        title: `${BRAND} – Order update`,
        preview: `Order ${orderId}: ${status}`,
        bodyHtml: `
          <h1 style="margin:0 0 12px;font-size:20px;color:${ACCENT};">Order update</h1>
          <p style="margin:0 0 12px;font-size:15px;line-height:1.6;">Hi ${customerName || 'there'},</p>
          <p style="margin:0 0 12px;font-size:15px;line-height:1.6;">
            Your order <strong>#${orderId}</strong>${productName ? ` (${productName})` : ''} is <strong>${label}</strong>.
          </p>
          ${trackLink}
        `,
    })
    const text = `Order #${orderId} update: ${status}.${trackUrl ? ` Track: ${trackUrl}` : ''}`
    return { html, text, subject: `${BRAND} – Order ${status}: #${orderId}` }
}

export function vendorNewOrder({ vendorName, orderId, productName, quantity, customerName, customerPhone }) {
    const html = baseLayout({
        title: `${BRAND} – New order`,
        preview: `New order #${orderId}`,
        bodyHtml: `
          <h1 style="margin:0 0 12px;font-size:20px;color:${ACCENT};">New order received</h1>
          <p style="margin:0 0 16px;font-size:14px;">Hi ${vendorName || 'Vendor'}, you have a new order on ${BRAND}.</p>
          <table role="presentation" width="100%" style="font-size:14px;line-height:1.7;">
            <tr><td style="color:#6b7280;width:120px;">Order ID</td><td><strong>${orderId}</strong></td></tr>
            <tr><td style="color:#6b7280;">Product</td><td>${productName || '—'}</td></tr>
            <tr><td style="color:#6b7280;">Quantity</td><td>${quantity || 1}</td></tr>
            <tr><td style="color:#6b7280;">Customer</td><td>${customerName || '—'}</td></tr>
            <tr><td style="color:#6b7280;">Phone</td><td>${customerPhone || '—'}</td></tr>
          </table>
          <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">Log in to your vendor dashboard to process and ship this order.</p>
        `,
    })
    const text = `New order #${orderId}: ${productName} x${quantity} from ${customerName}`
    return { html, text, subject: `${BRAND} – New order #${orderId}` }
}


import { sendTemplatedMail } from './mailService.js'
import { orderPlaced, orderStatusUpdate, vendorNewOrder } from './emailTemplates.js'
import { sendWhatsAppMessage } from './whatsappNotify.js'
import db from '../Config/Connection.js'
import collections from '../Config/Collection.js'
import { ObjectId } from 'mongodb'

function orderTotal(items) {
    return (items || []).reduce((sum, it) => {
        const price = Number(it.price ?? it.selling_price ?? 0)
        const qty = Number(it.quantity ?? 1)
        return sum + price * qty
    }, 0)
}

export async function notifyOrderPlaced({ userId, orderItems, customer }) {
    if (!orderItems?.length) return

    const firstOrderId = orderItems[0]?.OrderId || orderItems[0]?.secretOrderId || '—'
    const payType = customer?.payType || orderItems[0]?.details?.payType || 'cod'
    const total = orderTotal(orderItems)

    let buyerEmail = customer?.email
    let buyerName = customer?.name
    let buyerPhone = customer?.number

    if (userId) {
        try {
            const userDoc = await db.get().collection(collections.USERS).findOne({ _id: new ObjectId(userId) })
            if (userDoc) {
                buyerEmail = buyerEmail || userDoc.email
                buyerName = buyerName || userDoc.name
            }
        } catch (_) { /* optional */ }
    }

    if (buyerEmail) {
        const tpl = orderPlaced({
            customerName: buyerName,
            orderId: firstOrderId,
            items: orderItems,
            totalAmount: total,
            payType,
            address: customer,
        })
        await sendTemplatedMail({ to: buyerEmail, ...tpl })
    }

    if (buyerPhone) {
        await sendWhatsAppMessage({
            to: buyerPhone,
            body: `Indianet Express: Order #${firstOrderId} confirmed! Total ₹${total}. Payment: ${payType === 'online' ? 'Online' : 'COD'}. Track at ${process.env.CLIENT_URL || ''}/orders`,
        })
    }

    const vendorIds = [...new Set(orderItems.map((it) => it.vendorId).filter(Boolean))]
    for (const vendorId of vendorIds) {
        try {
            const vendorDoc = await db.get().collection(collections.VENDORS).findOne({ _id: new ObjectId(vendorId) })
            if (!vendorDoc) continue
            const vendorItems = orderItems.filter((it) => String(it.vendorId) === String(vendorId))
            for (const line of vendorItems) {
                const tpl = vendorNewOrder({
                    vendorName: vendorDoc.companyName || vendorDoc.adharName,
                    orderId: line.OrderId || line.secretOrderId,
                    productName: line.proName,
                    quantity: line.quantity,
                    customerName: buyerName,
                    customerPhone: buyerPhone,
                })
                if (vendorDoc.email) {
                    await sendTemplatedMail({ to: vendorDoc.email, ...tpl })
                }
                if (vendorDoc.phone || vendorDoc.mobile) {
                    await sendWhatsAppMessage({
                        to: vendorDoc.phone || vendorDoc.mobile,
                        body: `Indianet Express: New order #${line.OrderId || line.secretOrderId} — ${line.proName} x${line.quantity}. Customer: ${buyerName}, ${buyerPhone || ''}`,
                    })
                }
            }
        } catch (err) {
            console.error('[orderNotify] vendor alert failed:', err?.message)
        }
    }

    const adminMail = process.env.ADMIN_MAIL || process.env.SUPPORT_EMAIL
    if (adminMail) {
        await sendTemplatedMail({
            to: adminMail,
            subject: `Indianet – New order #${firstOrderId}`,
            text: `New order from ${buyerName} (${buyerEmail}). ${orderItems.length} item(s). Total ₹${total}.`,
            html: `<p>New order <strong>#${firstOrderId}</strong> from ${buyerName}.</p><p>Total: ₹${total}</p>`,
        })
    }
}

export async function notifyOrderStatusChanged({ userId, secretOrderId, newStatus, orderLine }) {
    if (!userId || !newStatus) return

    let buyerEmail = orderLine?.details?.email
    let buyerName = orderLine?.details?.name
    let buyerPhone = orderLine?.details?.number

    try {
        const userDoc = await db.get().collection(collections.USERS).findOne({ _id: new ObjectId(userId) })
        if (userDoc) {
            buyerEmail = buyerEmail || userDoc.email
            buyerName = buyerName || userDoc.name
        }
    } catch (_) { /* optional */ }

    const orderId = orderLine?.OrderId || secretOrderId
    const trackUrl = orderLine?.track_url || null

    if (buyerEmail) {
        const tpl = orderStatusUpdate({
            customerName: buyerName,
            orderId,
            productName: orderLine?.proName,
            status: newStatus,
            trackUrl,
        })
        await sendTemplatedMail({ to: buyerEmail, ...tpl })
    }

    if (buyerPhone) {
        const statusMsg = {
            Pending: 'received',
            Processing: 'being processed',
            Shipped: 'shipped',
            'In Transit': 'in transit',
            'Out For Delivery': 'out for delivery',
            Delivered: 'delivered',
            Cancelled: 'cancelled',
        }
        const msg = statusMsg[newStatus] || newStatus
        let body = `Indianet Express: Order #${orderId} is ${msg}.`
        if (trackUrl) body += ` Track: ${trackUrl}`
        await sendWhatsAppMessage({ to: buyerPhone, body })
    }
}

export async function getOrderLineForNotify(userId, secretOrderId) {
    const doc = await db.get().collection(collections.ORDERS).findOne({ _id: new ObjectId(userId) })
    if (!doc?.order) return null
    return doc.order.find((o) => o.secretOrderId === secretOrderId) || null
}

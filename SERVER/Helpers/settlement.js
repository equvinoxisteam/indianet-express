import db from '../Config/Connection.js'
import collections from '../Config/Collection.js'
import { ObjectId } from 'mongodb'

const CANCELLED = new Set(['Cancelled', 'cancelled'])

async function runRefreshDueSettlements(vendorId = null) {
    const now = new Date()
    const query = {
        order: {
            $elemMatch: {
                settlementStatus: 'pending',
                settlementDueAt: { $lte: now },
            },
        },
    }
    if (vendorId) {
        query.order.$elemMatch.vendorId = String(vendorId)
    }

    const docs = await db.get().collection(collections.ORDERS).find(query).toArray()

    for (const doc of docs) {
        let changed = false
        const order = (doc.order || []).map((item) => {
            if (
                item.settlementStatus === 'pending'
                && item.settlementDueAt
                && new Date(item.settlementDueAt) <= now
                && !CANCELLED.has(item.OrderStatus)
            ) {
                changed = true
                return { ...item, settlementStatus: 'due' }
            }
            return item
        })
        if (changed) {
            await db.get().collection(collections.ORDERS).updateOne(
                { _id: doc._id },
                { $set: { order } }
            )
        }
    }
}

function sumField(rows, field) {
    return rows.reduce((s, r) => s + (Number(r[field]) || 0), 0)
}

export default {
    async refreshDueSettlements(vendorId = null) {
        await runRefreshDueSettlements(vendorId)
    },

    async getAdminSettlementSummary() {
        await runRefreshDueSettlements()

        const rows = await db.get().collection(collections.ORDERS).aggregate([
            { $unwind: '$order' },
            {
                $match: {
                    'order.OrderStatus': { $nin: [...CANCELLED] },
                    'order.vendorPayout': { $exists: true },
                },
            },
            {
                $project: {
                    vendorId: '$order.vendorId',
                    vendorPayout: '$order.vendorPayout',
                    platformFeeTotal: '$order.platformFeeTotal',
                    settlementStatus: '$order.settlementStatus',
                    secretOrderId: '$order.secretOrderId',
                    userId: { $toString: '$_id' },
                    proName: '$order.proName',
                    OrderStatus: '$order.OrderStatus',
                    settlementDueAt: '$order.settlementDueAt',
                    settledAt: '$order.settledAt',
                    date: '$order.date',
                },
            },
        ]).toArray()

        const pending = rows.filter((r) => r.settlementStatus === 'pending')
        const due = rows.filter((r) => r.settlementStatus === 'due')
        const settled = rows.filter((r) => r.settlementStatus === 'settled')

        return {
            platformRevenueTotal: sumField(rows, 'platformFeeTotal'),
            platformRevenueSettled: sumField(settled, 'platformFeeTotal'),
            vendorPayoutPending: sumField(pending, 'vendorPayout'),
            vendorPayoutDue: sumField(due, 'vendorPayout'),
            vendorPayoutSettled: sumField(settled, 'vendorPayout'),
            countPending: pending.length,
            countDue: due.length,
            countSettled: settled.length,
            dueItems: due.slice(0, 100),
        }
    },

    async getVendorSettlementSummary(vendorId) {
        await runRefreshDueSettlements(vendorId)

        const rows = await db.get().collection(collections.ORDERS).aggregate([
            { $unwind: '$order' },
            {
                $match: {
                    'order.vendorId': String(vendorId),
                    'order.OrderStatus': { $nin: [...CANCELLED] },
                    'order.vendorPayout': { $exists: true },
                },
            },
            {
                $project: {
                    vendorPayout: '$order.vendorPayout',
                    platformFeeTotal: '$order.platformFeeTotal',
                    settlementStatus: '$order.settlementStatus',
                    secretOrderId: '$order.secretOrderId',
                    settlementDueAt: '$order.settlementDueAt',
                    settledAt: '$order.settledAt',
                    OrderStatus: '$order.OrderStatus',
                    date: '$order.date',
                    proName: '$order.proName',
                },
            },
        ]).toArray()

        const pending = rows.filter((r) => r.settlementStatus === 'pending')
        const due = rows.filter((r) => r.settlementStatus === 'due')
        const settled = rows.filter((r) => r.settlementStatus === 'settled')

        return {
            payoutPending: sumField(pending, 'vendorPayout'),
            payoutDue: sumField(due, 'vendorPayout'),
            payoutSettled: sumField(settled, 'vendorPayout'),
            platformFeesCollected: sumField(rows, 'platformFeeTotal'),
            countPending: pending.length,
            countDue: due.length,
            countSettled: settled.length,
            recentDue: due.slice(0, 20),
        }
    },

    markSettlementPaid({ userId, secretOrderId, vendorId }) {
        return db.get().collection(collections.ORDERS).updateOne(
            {
                _id: ObjectId(userId),
                'order.secretOrderId': secretOrderId,
                'order.vendorId': String(vendorId),
            },
            {
                $set: {
                    'order.$.settlementStatus': 'settled',
                    'order.$.settledAt': new Date(),
                },
            }
        )
    },
}

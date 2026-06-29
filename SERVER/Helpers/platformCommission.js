import {
    COMMISSION_PERCENT,
    FIXED_FEE_PER_LINE,
    SETTLEMENT_DAYS,
    getPlatformFeeConfig,
} from '../Config/platformFees.js'
import { computeGstAmount, toFiniteNumber } from '../ShipRocket/shippingTaxUtils.js'

export { getPlatformFeeConfig }

export function computeLinePlatformFee(sellingPrice) {
    const base = toFiniteNumber(sellingPrice, 0)
    const platformPercentFee = Math.round(base * (COMMISSION_PERCENT / 100) * 100) / 100
    const platformFixedFee = FIXED_FEE_PER_LINE
    const platformFeeTotal = Math.round((platformPercentFee + platformFixedFee) * 100) / 100
    const vendorPayout = base

    return {
        platformPercentFee,
        platformFixedFee,
        platformFeeTotal,
        vendorPayout,
        commissionPercent: COMMISSION_PERCENT,
    }
}

export function computeCheckoutTotals({
    lineSellingPrices = [],
    shippingAmount = 0,
}) {
    const trunc1 = (n) => Math.trunc(Number(n) * 10) / 10

    let subtotal = 0
    let platformPercentTotal = 0
    let platformFixedTotal = 0

    for (const sellingPrice of lineSellingPrices) {
        const line = toFiniteNumber(sellingPrice, 0)
        subtotal += line
        const fees = computeLinePlatformFee(line)
        platformPercentTotal += fees.platformPercentFee
        platformFixedTotal += fees.platformFixedFee
    }

    platformPercentTotal = Math.round(platformPercentTotal * 100) / 100
    platformFixedTotal = Math.round(platformFixedTotal * 100) / 100
    const platformFees = Math.round((platformPercentTotal + platformFixedTotal) * 100) / 100
    const gstAmount = computeGstAmount(subtotal)
    const shipping = toFiniteNumber(shippingAmount, 0)
    const totalPrice = subtotal + platformFees + gstAmount + shipping

    return {
        subtotal: trunc1(subtotal),
        platformFees: trunc1(platformFees),
        platformPercentTotal: trunc1(platformPercentTotal),
        platformFixedTotal: trunc1(platformFixedTotal),
        commissionPercent: COMMISSION_PERCENT,
        fixedFeePerLine: FIXED_FEE_PER_LINE,
        gstAmount: trunc1(gstAmount),
        gstPercent: 18,
        shippingAmount: trunc1(shipping),
        totalPrice: trunc1(totalPrice),
    }
}

export function getSettlementDueDate(fromDate = new Date()) {
    const d = new Date(fromDate)
    d.setDate(d.getDate() + SETTLEMENT_DAYS)
    return d
}

export function enrichOrderItemWithPlatformFees(item, orderDate = new Date()) {
    const selling = toFiniteNumber(item.selling_price, 0)
    const fees = computeLinePlatformFee(selling)

    item.platformPercentFee = fees.platformPercentFee
    item.platformFixedFee = fees.platformFixedFee
    item.platformFeeTotal = fees.platformFeeTotal
    item.vendorPayout = fees.vendorPayout
    item.commissionPercent = fees.commissionPercent
    item.settlementStatus = 'pending'
    item.settlementDueAt = getSettlementDueDate(orderDate)
    item.settledAt = null
    item.orderPlacedAt = orderDate

    return item
}

export function enrichOrderItemsWithPlatformFees(orderItems, orderDate = new Date()) {
    for (const item of orderItems || []) {
        enrichOrderItemWithPlatformFees(item, orderDate)
    }
    return orderItems
}

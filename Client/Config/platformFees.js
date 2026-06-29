export const COMMISSION_PERCENT = 15
export const FIXED_FEE_PER_LINE = 30
export const SETTLEMENT_DAYS = 30
export const GST_PERCENT = 18

export function computeLinePlatformFee(sellingPrice) {
    const base = Number(sellingPrice) || 0
    const platformPercentFee = Math.round(base * (COMMISSION_PERCENT / 100) * 100) / 100
    const platformFixedFee = FIXED_FEE_PER_LINE
    const platformFeeTotal = Math.round((platformPercentFee + platformFixedFee) * 100) / 100
    return {
        platformPercentFee,
        platformFixedFee,
        platformFeeTotal,
        vendorPayout: base,
        customerProductPlusFee: base + platformFeeTotal,
    }
}

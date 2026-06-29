export const COMMISSION_PERCENT = Number(process.env.PLATFORM_COMMISSION_PERCENT || 15)
export const FIXED_FEE_PER_LINE = Number(process.env.PLATFORM_FIXED_FEE || 30)
export const SETTLEMENT_DAYS = Number(process.env.SETTLEMENT_DAYS || 30)
export const GST_PERCENT = 18

export function getPlatformFeeConfig() {
    return {
        commissionPercent: COMMISSION_PERCENT,
        fixedFeePerLine: FIXED_FEE_PER_LINE,
        settlementDays: SETTLEMENT_DAYS,
        gstPercent: GST_PERCENT,
    }
}

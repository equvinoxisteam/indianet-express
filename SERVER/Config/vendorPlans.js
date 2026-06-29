export const VENDOR_PLAN_KEYS = ['free', 'basic', 'plus', 'pro', 'premium']

export const PLAN_BILLING_PERIODS = ['annual', 'semiannual']

export const VENDOR_PLANS = {
    free: {
        label: 'Seller',
        annualPrice: 0,
        rfqQuotaMonthly: 0,
        showcaseLimit: null,
        adsEnabled: false,
        verifiedBadge: false,
        showCompanyProfile: true,
        supplierRating: null,
        canChangeShowcaseWhenLocked: true,
    },
    basic: {
        label: 'Basic',
        annualPrice: 165000,
        rfqQuotaMonthly: 20,
        showcaseLimit: 5,
        adsEnabled: false,
        verifiedBadge: false,
        showCompanyProfile: false,
        supplierRating: null,
        canChangeShowcaseWhenLocked: false,
    },
    plus: {
        label: 'Plus',
        annualPrice: 247500,
        rfqQuotaMonthly: 40,
        showcaseLimit: 20,
        adsEnabled: 'basic',
        verifiedBadge: true,
        showCompanyProfile: true,
        supplierRating: null,
        canChangeShowcaseWhenLocked: false,
    },
    pro: {
        label: 'Pro',
        annualPrice: 351000,
        rfqQuotaMonthly: 60,
        showcaseLimit: 20,
        adsEnabled: 'product',
        verifiedBadge: true,
        showCompanyProfile: true,
        supplierRating: 2,
        canChangeShowcaseWhenLocked: true,
    },
    premium: {
        label: 'Premium',
        annualPrice: 1125000,
        rfqQuotaMonthly: null,
        showcaseLimit: null,
        adsEnabled: 'full',
        verifiedBadge: true,
        showCompanyProfile: true,
        supplierRating: 4,
        canChangeShowcaseWhenLocked: true,
    },
}

/** 6-month price = half of annual + 10% */
export function calculatePlanPrice(annualPrice, period = 'annual') {
    const annual = Number(annualPrice) || 0
    if (!annual) return 0
    if (period === 'semiannual') return Math.round((annual / 2) * 1.1)
    return annual
}

export function getVerificationTagsForPlan(config) {
    if (!config?.verifiedBadge) return []
    const tags = ['Verified Vendor']
    if (config.key === 'premium') tags.push('Verified Supplier')
    return tags
}

export function normalizePlanKey(plan) {
    if (!plan) return null
    const key = String(plan).trim().toLowerCase()
    return VENDOR_PLAN_KEYS.includes(key) ? key : null
}

export function getPlanConfig(planKey) {
    const key = normalizePlanKey(planKey)
    if (!key) return null
    return { key, ...VENDOR_PLANS[key] }
}

export function planCanChangeShowcase(planKey) {
    const config = getPlanConfig(planKey)
    return !!config?.canChangeShowcaseWhenLocked
}

export function isUnlimitedShowcase(limit) {
    return limit == null
}

export function getMonthStart(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function addMonths(date, months = 6) {
    const d = new Date(date)
    d.setMonth(d.getMonth() + months)
    return d
}

export function addYears(date, years = 1) {
    const d = new Date(date)
    d.setFullYear(d.getFullYear() + years)
    return d
}

export function shouldResetQuota(periodStart) {
    if (!periodStart) return true
    const start = new Date(periodStart)
    const now = new Date()
    return start.getFullYear() !== now.getFullYear() || start.getMonth() !== now.getMonth()
}

export function isPlanExpired(vendor) {
    if (!vendor?.planExpiresAt) return false
    return new Date(vendor.planExpiresAt).getTime() < Date.now()
}

export function computePlanExpiry(now, planKey, period = 'annual', customExpiresAt = null) {
    if (customExpiresAt) return new Date(customExpiresAt)
    const config = getPlanConfig(planKey)
    if (!config || config.key === 'free') return null
    if (period === 'semiannual') return addMonths(now, 6)
    return addYears(now, 1)
}

export function buildActivationFields(planKey, options = {}) {
    const config = getPlanConfig(planKey)
    if (!config) return null

    const now = new Date()
    const isFree = config.key === 'free'
    const period = options.period === 'semiannual' ? 'semiannual' : 'annual'
    const verificationTags = getVerificationTagsForPlan(config)

    return {
        plan: config.key,
        planStatus: 'active',
        planRequested: config.key,
        planActivatedAt: now,
        planBillingPeriod: isFree ? null : period,
        planExpiresAt: isFree ? null : computePlanExpiry(now, planKey, period, options.expiresAt),
        planPreventAutoDowngrade: !!options.preventAutoDowngrade,
        planDowngradeTo: normalizePlanKey(options.downgradeToPlan) || 'free',
        planUpgradePending: false,
        planExpiryWarningSentAt: null,
        planPausedAt: null,
        rfqQuotaLimit: config.rfqQuotaMonthly,
        rfqQuotaUsed: 0,
        rfqQuotaPeriodStart: getMonthStart(now),
        showcaseLimit: config.showcaseLimit,
        showcaseLocked: false,
        adsEnabled: config.adsEnabled,
        verifiedBadge: config.verifiedBadge,
        supplierRating: config.supplierRating,
        verificationTags,
    }
}

export function getPlanCatalogForClient() {
    return VENDOR_PLAN_KEYS.map((key) => {
        const plan = VENDOR_PLANS[key]
        return {
            key,
            ...plan,
            semiannualPrice: calculatePlanPrice(plan.annualPrice, 'semiannual'),
            annualPrice: plan.annualPrice,
            showcaseUnlimited: plan.showcaseLimit == null,
        }
    })
}

export function getPlanDaysRemaining(vendor) {
    if (!vendor?.planExpiresAt || vendor?.plan === 'free') return null
    const ms = new Date(vendor.planExpiresAt).getTime() - Date.now()
    if (ms <= 0) return 0
    return Math.ceil(ms / (24 * 60 * 60 * 1000))
}

export function getPlanAccess(vendor) {
    const status = vendor?.planStatus || 'none'
    const planKey = normalizePlanKey(vendor?.plan)
    const config = planKey ? getPlanConfig(planKey) : null
    const paused = status === 'paused'
    const expired = status === 'active' && isPlanExpired(vendor)
    const active = status === 'active' && planKey && config && !expired && !paused

    const rfqLimit = active ? config.rfqQuotaMonthly : null
    const rfqUsed = vendor?.rfqQuotaUsed || 0
    const showcaseLimit = active ? config.showcaseLimit : 0

    const daysRemaining = active && vendor?.planExpiresAt ? getPlanDaysRemaining(vendor) : (expired ? 0 : null)

    return {
        planStatus: paused ? 'paused' : (expired ? 'expired' : status),
        plan: planKey,
        planLabel: config?.label || null,
        isPaused: paused,
        planDaysRemaining: daysRemaining,
        planExpiryWarningSentAt: vendor?.planExpiryWarningSentAt || null,
        planRequested: normalizePlanKey(vendor?.planRequested),
        planRequestedLabel: getPlanConfig(vendor?.planRequested)?.label || null,
        planRequestedAt: vendor?.planRequestedAt || null,
        planActivatedAt: vendor?.planActivatedAt || null,
        planExpiresAt: vendor?.planExpiresAt || null,
        planBillingPeriod: vendor?.planBillingPeriod || null,
        planPreventAutoDowngrade: !!vendor?.planPreventAutoDowngrade,
        planDowngradeTo: normalizePlanKey(vendor?.planDowngradeTo) || 'free',
        isActive: !!active,
        isPending: status === 'pending' || !!vendor?.planUpgradePending,
        isExpired: expired,
        isExpiringSoon: !!active && daysRemaining != null && daysRemaining > 0 && daysRemaining <= 1,
        canAccessRfq: !!active && (rfqLimit == null || rfqLimit > 0),
        canPublishProducts: !!active,
        rfqQuotaLimit: rfqLimit,
        rfqQuotaUsed: rfqUsed,
        rfqQuotaRemaining: rfqLimit == null ? (active ? null : 0) : Math.max(0, rfqLimit - rfqUsed),
        showcaseLimit,
        showcaseUnlimited: active && isUnlimitedShowcase(showcaseLimit),
        showcaseLocked: !!vendor?.showcaseLocked,
        canChangeShowcase: active ? planCanChangeShowcase(planKey) : false,
        adsEnabled: active ? config.adsEnabled : false,
        verifiedBadge: active ? config.verifiedBadge : false,
        showCompanyProfile: active ? !!config.showCompanyProfile : false,
        supplierRating: active ? config.supplierRating : null,
        canLinkStorefront: !!active,
    }
}

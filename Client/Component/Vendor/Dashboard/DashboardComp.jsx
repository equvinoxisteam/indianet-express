import { useRouter } from "next/router"

function DashboardComp({ response }) {
    const navigate = useRouter()
    const analytics = response?.analytics || {}
    const settlement = response?.settlementSummary || {}
    const ordersPending = analytics.ordersPending ?? 0
    const ordersProcessing = analytics.ordersProcessing ?? 0
    const ordersDelivered = analytics.ordersDelivered ?? 0
    const revenue = analytics.totalRevenue ?? 0

    return (
        <div className='containerVendor'>
            <div className="dashboard pb-4">
                <div className="vendorPageHeader">
                    <h1 className="vendorPageTitle">Seller Dashboard</h1>
                    <p className="vendorPageSubtitle">Orders, earnings &amp; 30-day settlement</p>
                </div>

                <div className="panelCard mb-4">
                    <div className="panelCardHeader">
                        <h5>Your earnings (after platform fee collected from buyer)</h5>
                    </div>
                    <div className="dashboardGrid">
                        <div className="cardDash">
                            <h6>Pending settlement (&lt;30 days)</h6>
                            <h5>₹ {Number(settlement.payoutPending || 0).toLocaleString('en-IN')}</h5>
                        </div>
                        <div className="cardDash">
                            <h6>Due for payout</h6>
                            <h5>₹ {Number(settlement.payoutDue || 0).toLocaleString('en-IN')}</h5>
                        </div>
                        <div className="cardDash">
                            <h6>Already paid to you</h6>
                            <h5>₹ {Number(settlement.payoutSettled || 0).toLocaleString('en-IN')}</h5>
                        </div>
                        <div className="cardDash">
                            <h6>Platform fees (from buyers)</h6>
                            <h5>₹ {Number(settlement.platformFeesCollected || 0).toLocaleString('en-IN')}</h5>
                        </div>
                    </div>
                    <p className="text-muted small mb-0 mt-3">
                        You list the product price — you receive that full amount. Buyer pays an extra 15% + ₹30 per item (platform fee) + GST + shipping.
                        Payouts are released after 30 days from order date.
                    </p>
                </div>

                <div className="dashboardGrid mb-4">
                    <div className="cardDash">
                        <h6>Products listed</h6>
                        <h5>{analytics.products ?? 0}</h5>
                    </div>
                    <div className="cardDash">
                        <h6>Pending orders</h6>
                        <h5>{ordersPending}</h5>
                    </div>
                    <div className="cardDash">
                        <h6>Processing / shipped</h6>
                        <h5>{ordersProcessing}</h5>
                    </div>
                    <div className="cardDash">
                        <h6>Delivered</h6>
                        <h5>{ordersDelivered}</h5>
                    </div>
                </div>

                <div className="panelCard mb-4">
                    <div className="panelCardHeader">
                        <h5>Quick actions</h5>
                    </div>
                    <div className="dashboardGrid">
                        <div className="cardDash">
                            <h6>Delivered revenue</h6>
                            <h5>₹ {Number(revenue).toLocaleString('en-IN')}</h5>
                        </div>
                        <div className="cardDash">
                            <button type="button" className="vendorBtnPrimary w-100" onClick={() => navigate.push('/vendor/products/add')}>
                                Add product
                            </button>
                        </div>
                        <div className="cardDash">
                            <button type="button" className="vendorBtnSecondary w-100" onClick={() => navigate.push('/vendor/products')}>
                                Manage products
                            </button>
                        </div>
                        <div className="cardDash">
                            <button type="button" className="vendorBtnSecondary w-100" onClick={() => navigate.push('/vendor/orders')}>
                                View orders
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardComp

import { useRouter } from "next/router"

function DashboardComp({ response }) {
    const navigate = useRouter()
    const analytics = response?.analytics || {}
    const ordersPending = analytics.ordersPending ?? 0
    const ordersProcessing = analytics.ordersProcessing ?? 0
    const ordersDelivered = analytics.ordersDelivered ?? 0
    const revenue = analytics.totalRevenue ?? 0

    return (
        <div className='containerVendor'>
            <div className="dashboard pb-4">
                <div className="vendorPageHeader">
                    <h1 className="vendorPageTitle">Seller Dashboard</h1>
                    <p className="vendorPageSubtitle">Manage products, process orders, and ship to customers across India</p>
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
                            <h6>Revenue (delivered)</h6>
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

                <div className="panelCard mb-4">
                    <div className="panelCardHeader">
                        <h5>How fulfillment works</h5>
                    </div>
                    <ol className="text-muted small mb-0 ps-3" style={{ lineHeight: 1.8 }}>
                        <li>Customer places order and pays (online or COD).</li>
                        <li>You receive email &amp; WhatsApp with order details.</li>
                        <li>Pack the item and mark status as <strong>Processing</strong>, then <strong>Shipped</strong>.</li>
                        <li>Shiprocket picks up from your warehouse PIN and delivers to the buyer.</li>
                        <li>Buyer tracks shipment from their account — you can view AWB in order details.</li>
                    </ol>
                </div>
            </div>
        </div>
    )
}

export default DashboardComp

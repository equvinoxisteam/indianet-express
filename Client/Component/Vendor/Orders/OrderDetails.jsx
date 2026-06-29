import { useState } from 'react'
import { vendorAxios } from '../../../Config/Server'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'In Transit', 'Out For Delivery', 'Delivered', 'Cancelled']

function EditOrder({ Order, onUpdated }) {
    const [status, setStatus] = useState(Order.OrderStatus || 'Pending')
    const [saving, setSaving] = useState(false)

    const awb = Order?.track?.tracking_data?.shipment_track?.[0]?.awb_code
        || Order?.track?.awb
        || Order?.awb
    const courier = Order?.track?.tracking_data?.shipment_track?.[0]?.courier_name

    const updateStatus = () => {
        if (!Order.userId || !Order.secretOrderId) return
        setSaving(true)
        vendorAxios((server) => {
            server.put('/vendor/updateOrderStatus', {
                userId: Order.userId,
                secretOrderId: Order.secretOrderId,
                OrderStatus: status,
            }).then(() => {
                toast.success('Order status updated — customer notified by email & WhatsApp')
                onUpdated?.(status)
            }).catch(() => toast.error('Could not update order status'))
                .finally(() => setSaving(false))
        })
    }

    return (
        <div className='containerVendor OrderDetails'>
            <div className="vendorPageHeader">
                <h1 className="vendorPageTitle">Order details</h1>
                <p className="vendorPageSubtitle">Process, ship and update order status — buyer gets email & WhatsApp alerts</p>
            </div>

            <div className="settingsProfileCard">
                <div className='d-flex flex-wrap gap-2 mb-3'>
                    <button
                        type="button"
                        className="vendorBtnSecondary"
                        onClick={() => window.open(`/p/${Order.slug}/${Order.proId}`, '_blank')}
                    >
                        <i className="fa-solid fa-up-right-from-square me-1" /> Show product
                    </button>
                </div>

                <div className="row g-3 mb-4">
                    <div className='col-12 col-md-6'>
                        <label className="form-label fw-semibold">Update order status</label>
                        <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    <div className='col-12 col-md-6 d-flex align-items-end'>
                        <button type="button" className="vendorBtnPrimary" onClick={updateStatus} disabled={saving}>
                            {saving ? 'Saving…' : 'Save & notify customer'}
                        </button>
                    </div>
                </div>

                <div className="row g-3">
                    <div className='col-12 col-md-6'>
                        <label className="form-label fw-semibold">Current status</label>
                        <input type="text" className="form-control" value={Order.OrderStatus || ''} readOnly disabled />
                    </div>
                    <div className='col-12 col-md-6'>
                        <label className="form-label fw-semibold">Created on</label>
                        <input type="text" className="form-control" value={Order.created || ''} readOnly disabled />
                    </div>
                    <div className='col-12 col-md-6'>
                        <label className="form-label fw-semibold">Order ID</label>
                        <input type="text" className="form-control" value={Order.secretOrderId || ''} readOnly disabled />
                    </div>
                    <div className='col-12 col-md-6'>
                        <label className="form-label fw-semibold">Variant</label>
                        <input type="text" className="form-control" value={Order.variantSize || '—'} readOnly disabled />
                    </div>

                    <div className='col-12'><h3 className="settingsProfileCardTitle">Payment & product</h3></div>
                    <div className='col-12 col-md-6'>
                        <label className="form-label fw-semibold">Payment</label>
                        <input type="text" className="form-control" value={Order.details?.payType === 'online' ? 'Online (Razorpay)' : 'Cash on delivery'} readOnly disabled />
                    </div>
                    <div className='col-12 col-md-6'>
                        <label className="form-label fw-semibold">Payment ID</label>
                        <input type="text" className="form-control" value={Order.payId || '—'} readOnly disabled />
                    </div>
                    <div className='col-12'>
                        <label className="form-label fw-semibold">Product</label>
                        <textarea className="form-control" value={Order.proName || ''} rows={2} readOnly disabled />
                    </div>
                    <div className='col-12 col-md-4'>
                        <label className="form-label fw-semibold">Qty</label>
                        <input type="text" className="form-control" value={Order.quantity ?? ''} readOnly disabled />
                    </div>
                    <div className='col-12 col-md-4'>
                        <label className="form-label fw-semibold">Price (₹)</label>
                        <input type="text" className="form-control" value={Order.price ?? ''} readOnly disabled />
                    </div>
                    <div className='col-12 col-md-4'>
                        <label className="form-label fw-semibold">MRP (₹)</label>
                        <input type="text" className="form-control" value={Order.mrp ?? ''} readOnly disabled />
                    </div>

                    <div className='col-12'><h3 className="settingsProfileCardTitle">Shipping (Shiprocket)</h3></div>
                    <div className='col-12 col-md-4'>
                        <label className="form-label fw-semibold">Shiprocket order ID</label>
                        <input type="text" className="form-control" value={Order.order_id_shiprocket || '—'} readOnly disabled />
                    </div>
                    <div className='col-12 col-md-4'>
                        <label className="form-label fw-semibold">Shipment ID</label>
                        <input type="text" className="form-control" value={Order.shipment_id || '—'} readOnly disabled />
                    </div>
                    <div className='col-12 col-md-4'>
                        <label className="form-label fw-semibold">AWB / tracking</label>
                        <input type="text" className="form-control" value={awb || '—'} readOnly disabled />
                    </div>
                    {courier && (
                        <div className='col-12 col-md-6'>
                            <label className="form-label fw-semibold">Courier</label>
                            <input type="text" className="form-control" value={courier} readOnly disabled />
                        </div>
                    )}
                    {awb && (
                        <div className='col-12'>
                            <a
                                className="vendorBtnSecondary d-inline-flex align-items-center gap-2"
                                href={`https://shiprocket.co/tracking/${awb}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <i className="fa-solid fa-truck" /> Track on Shiprocket
                            </a>
                        </div>
                    )}

                    <div className='col-12'><h3 className="settingsProfileCardTitle">Ship to</h3></div>
                    <div className='col-12 col-md-6'>
                        <label className="form-label fw-semibold">Customer</label>
                        <input type="text" className="form-control" value={Order.details?.name || ''} readOnly disabled />
                    </div>
                    <div className='col-12 col-md-6'>
                        <label className="form-label fw-semibold">Phone</label>
                        <input type="text" className="form-control" value={Order.details?.number || ''} readOnly disabled />
                    </div>
                    <div className='col-12 col-md-6'>
                        <label className="form-label fw-semibold">Email</label>
                        <input type="text" className="form-control" value={Order.details?.email || ''} readOnly disabled />
                    </div>
                    <div className='col-12 col-md-6'>
                        <label className="form-label fw-semibold">PIN</label>
                        <input type="text" className="form-control" value={Order.details?.pin || ''} readOnly disabled />
                    </div>
                    <div className='col-12'>
                        <label className="form-label fw-semibold">Address</label>
                        <textarea className="form-control" value={`${Order.details?.address || ''}, ${Order.details?.locality || ''}, ${Order.details?.city || ''}, ${Order.details?.state || ''}`} rows={3} readOnly disabled />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditOrder

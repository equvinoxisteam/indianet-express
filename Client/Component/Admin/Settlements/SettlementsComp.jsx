import { useEffect, useState } from 'react'
import { adminAxios } from '@/Config/Server'
import toast from 'react-hot-toast'

function SettlementsComp() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    const load = () => {
        setLoading(true)
        adminAxios((server) => {
            server.get('/admin/getSettlements').then((res) => {
                setData(res.data)
            }).catch(() => toast.error('Could not load settlements'))
                .finally(() => setLoading(false))
        })
    }

    useEffect(() => { load() }, [])

    const markPaid = (item) => {
        adminAxios((server) => {
            server.put('/admin/markSettlementPaid', {
                userId: item.userId,
                secretOrderId: item.secretOrderId,
                vendorId: item.vendorId,
            }).then(() => {
                toast.success('Marked as paid')
                load()
            }).catch(() => toast.error('Failed to update'))
        })
    }

    if (loading) return <div className="containerAdmin p-4">Loading settlements…</div>

    return (
        <div className="containerAdmin">
            <div className="adminPageHeader mb-4">
                <h1 className="adminPageTitle">Settlements &amp; platform revenue</h1>
                <p className="adminPageSubtitle">15% + ₹30 per item collected from buyers — vendor payout after 30 days</p>
            </div>

            <div className="row g-3 mb-4">
                {[
                    { label: 'Platform revenue (all time)', value: data?.platformRevenueTotal },
                    { label: 'Vendor payout pending', value: data?.vendorPayoutPending },
                    { label: 'Vendor payout due now', value: data?.vendorPayoutDue },
                    { label: 'Vendor payout settled', value: data?.vendorPayoutSettled },
                ].map((card) => (
                    <div className="col-6 col-lg-3" key={card.label}>
                        <div className="bg-white border rounded p-3 h-100">
                            <p className="text-muted small mb-1">{card.label}</p>
                            <h4 className="font-bold mb-0">₹ {Number(card.value || 0).toLocaleString('en-IN')}</h4>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white border rounded p-3">
                <h5 className="font-bold mb-3">Due for vendor payout ({data?.countDue ?? 0})</h5>
                {(data?.dueItems || []).length === 0 ? (
                    <p className="text-muted mb-0">No settlements due right now.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-sm align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Product</th>
                                    <th>Vendor</th>
                                    <th>Payout</th>
                                    <th>Platform fee</th>
                                    <th>Due date</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.dueItems.map((item) => (
                                    <tr key={`${item.userId}-${item.secretOrderId}`}>
                                        <td className="text-small">{item.secretOrderId}</td>
                                        <td>{item.proName}</td>
                                        <td className="text-small">{item.vendorId}</td>
                                        <td>₹ {Number(item.vendorPayout || 0).toLocaleString('en-IN')}</td>
                                        <td>₹ {Number(item.platformFeeTotal || 0).toLocaleString('en-IN')}</td>
                                        <td className="text-small">{item.settlementDueAt ? new Date(item.settlementDueAt).toLocaleDateString() : '—'}</td>
                                        <td>
                                            <button type="button" className="btn btn-sm btn-primary" onClick={() => markPaid(item)}>
                                                Mark paid
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SettlementsComp

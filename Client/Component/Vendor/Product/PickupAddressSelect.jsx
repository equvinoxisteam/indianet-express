import { useEffect, useState } from 'react'
import { vendorAxios } from '../../../Config/Server'

export default function PickupAddressSelect({ value, onChange, required = false }) {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    vendorAxios((server) => {
      server.get('/vendor/pickupAddresses')
        .then((res) => {
          const list = Array.isArray(res.data) ? res.data : []
          setAddresses(list)
          if (!value && list.length) {
            const def = list.find((a) => a.isDefault) || list[0]
            onChange(def.id)
          }
        })
        .catch(() => setAddresses([]))
        .finally(() => setLoading(false))
    })
  }, [])

  if (loading) {
    return <p className="small text-muted mb-0">Loading pickup addresses…</p>
  }

  if (!addresses.length) {
    return (
      <div className="alert alert-warning small mb-0">
        Add at least one pickup address under{' '}
        <a href="/vendor/settings">Settings → Pickup addresses</a> before publishing products.
      </div>
    )
  }

  return (
    <select
      className="form-select"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      required={required}
    >
      <option value="">Select pickup address</option>
      {addresses.map((a) => (
        <option key={a.id} value={a.id}>
          {a.label} — {a.city}, {a.state} ({a.pinCode}){a.isDefault ? ' (default)' : ''}
        </option>
      ))}
    </select>
  )
}

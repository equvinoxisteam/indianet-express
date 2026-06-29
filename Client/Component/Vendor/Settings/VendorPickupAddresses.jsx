import { useEffect, useState } from 'react'
import { vendorAxios } from '../../../Config/Server'

const emptyForm = {
  label: '',
  contactName: '',
  phone: '',
  address: '',
  address2: '',
  city: '',
  state: '',
  pinCode: '',
  isDefault: false,
}

export default function VendorPickupAddresses() {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  const load = () => {
    setLoading(true)
    vendorAxios((server) => {
      server.get('/vendor/pickupAddresses')
        .then((res) => setAddresses(Array.isArray(res.data) ? res.data : []))
        .catch(() => setAddresses([]))
        .finally(() => setLoading(false))
    })
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const startEdit = (addr) => {
    setEditingId(addr.id)
    setForm({
      label: addr.label || '',
      contactName: addr.contactName || '',
      phone: addr.phone || '',
      address: addr.address || '',
      address2: addr.address2 || '',
      city: addr.city || '',
      state: addr.state || '',
      pinCode: addr.pinCode || '',
      isDefault: !!addr.isDefault,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, pinCode: String(form.pinCode || '').trim().toUpperCase() }
    vendorAxios((server) => {
      const req = editingId
        ? server.put(`/vendor/pickupAddresses/${editingId}`, payload)
        : server.post('/vendor/pickupAddresses', payload)
      req.then(() => {
        resetForm()
        load()
      }).catch((err) => {
        alert(err.response?.data?.error || 'Could not save pickup address.')
      }).finally(() => setSaving(false))
    })
  }

  const handleDelete = (id) => {
    if (!window.confirm('Delete this pickup address? Products using it must be updated.')) return
    vendorAxios((server) => {
      server.delete(`/vendor/pickupAddresses/${id}`)
        .then(() => load())
        .catch((err) => alert(err.response?.data?.error || 'Could not delete address.'))
    })
  }

  return (
    <div className="vendorPickupPanel">
      <h5 className="mb-2">Pickup addresses</h5>
      <p className="text-muted small mb-4">
        Add warehouses or shops where Shiprocket will collect orders. Each product uses one pickup address for shipping estimates and labels.
      </p>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <div className="table-responsive mb-4">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>Label</th>
                <th>Address</th>
                <th>PIN</th>
                <th>Default</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {addresses.length === 0 && (
                <tr><td colSpan={5} className="text-muted">No pickup addresses yet.</td></tr>
              )}
              {addresses.map((a) => (
                <tr key={a.id}>
                  <td>{a.label}</td>
                  <td className="small">{a.address}{a.address2 ? `, ${a.address2}` : ''}, {a.city}, {a.state}</td>
                  <td>{a.pinCode}</td>
                  <td>{a.isDefault ? 'Yes' : '—'}</td>
                  <td className="text-nowrap">
                    <button type="button" className="btn btn-link btn-sm p-0 me-2" onClick={() => startEdit(a)}>Edit</button>
                    <button type="button" className="btn btn-link btn-sm text-danger p-0" onClick={() => handleDelete(a.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form onSubmit={handleSubmit} className="border rounded p-3 bg-light">
        <h6 className="mb-3">{editingId ? 'Edit address' : 'Add new address'}</h6>
        <div className="row g-2">
          <div className="col-md-4">
            <label className="form-label small">Label</label>
            <input className="form-control form-control-sm" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Main warehouse" required />
          </div>
          <div className="col-md-4">
            <label className="form-label small">Contact name</label>
            <input className="form-control form-control-sm" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} required />
          </div>
          <div className="col-md-4">
            <label className="form-label small">Phone</label>
            <input className="form-control form-control-sm" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={10} required />
          </div>
          <div className="col-md-6">
            <label className="form-label small">Address line 1</label>
            <input className="form-control form-control-sm" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          </div>
          <div className="col-md-6">
            <label className="form-label small">Address line 2 / locality</label>
            <input className="form-control form-control-sm" value={form.address2} onChange={(e) => setForm({ ...form, address2: e.target.value })} />
          </div>
          <div className="col-md-4">
            <label className="form-label small">City</label>
            <input className="form-control form-control-sm" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          </div>
          <div className="col-md-4">
            <label className="form-label small">State</label>
            <input className="form-control form-control-sm" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
          </div>
          <div className="col-md-4">
            <label className="form-label small">PIN code</label>
            <input className="form-control form-control-sm" value={form.pinCode} onChange={(e) => setForm({ ...form, pinCode: e.target.value })} maxLength={6} required />
          </div>
          <div className="col-12">
            <label className="form-check small">
              <input type="checkbox" className="form-check-input" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
              <span className="form-check-label">Set as default pickup</span>
            </label>
          </div>
        </div>
        <div className="mt-3 d-flex gap-2">
          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : (editingId ? 'Update' : 'Add address')}</button>
          {editingId && (
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={resetForm}>Cancel</button>
          )}
        </div>
      </form>
    </div>
  )
}

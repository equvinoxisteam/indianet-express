import db from '../Config/Connection.js'
import collections from '../Config/Collection.js'
import { ObjectId } from 'mongodb'
import crypto from 'crypto'
import tokenShipRocket from '../ShipRocket/token.js'
import addPickupAddress from '../ShipRocket/addPickupAddress.js'

function newAddressId() {
    return crypto.randomBytes(6).toString('hex')
}

export function buildShiprocketNickname(vendorId, addressId) {
    const raw = `IE${String(vendorId).replace(/[^a-zA-Z0-9]/g, '').slice(-8)}${addressId}`
    return raw.slice(0, 36)
}

function normalizeAddress(input = {}) {
    return {
        label: String(input.label || 'Warehouse').trim().slice(0, 80),
        contactName: String(input.contactName || input.name || '').trim(),
        phone: String(input.phone || '').replace(/\D/g, '').slice(0, 10),
        address: String(input.address || '').trim(),
        address2: String(input.address2 || input.locality || '').trim(),
        city: String(input.city || '').trim(),
        state: String(input.state || '').trim(),
        pinCode: String(input.pinCode || '').trim().toUpperCase(),
        country: String(input.country || 'India').trim(),
        isDefault: !!input.isDefault,
    }
}

async function syncPickupToShiprocket(vendor, address) {
    const configured = Boolean(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASS)
    if (!configured || !address?.shiprocketNickname) return

    const token = await tokenShipRocket().catch(() => null)
    if (!token) return

    await addPickupAddress({
        pickup_location: address.shiprocketNickname,
        name: address.contactName || vendor.adharName || vendor.companyName || 'Seller',
        email: vendor.email,
        phone: address.phone || vendor.number,
        address: address.address,
        address_2: address.address2 || '',
        pin_code: address.pinCode,
        city: address.city,
        state: address.state,
        country: address.country || 'India',
    }, token).catch(() => null)
}

export default {
    async getVendorDoc(vendorId) {
        return db.get().collection(collections.VENDORS).findOne({ _id: ObjectId(vendorId) })
    },

    async getAddresses(vendorId) {
        const vendor = await this.getVendorDoc(vendorId)
        if (!vendor) return []
        let list = Array.isArray(vendor.pickupAddresses) ? vendor.pickupAddresses : []
        if (list.length === 0) {
            list = await this.ensureDefaultFromVendor(vendor)
        }
        return list
    },

    async ensureDefaultFromVendor(vendor) {
        if (!vendor?.pinCode) return []
        const existing = Array.isArray(vendor.pickupAddresses) ? vendor.pickupAddresses : []
        if (existing.length > 0) return existing

        const id = newAddressId()
        const address = {
            id,
            label: 'Main warehouse',
            contactName: vendor.adharName || vendor.companyName || '',
            phone: vendor.number || '',
            address: vendor.address || '',
            address2: vendor.locality || '',
            city: vendor.city || '',
            state: vendor.state || '',
            pinCode: vendor.pinCode || '',
            country: vendor.country || 'India',
            shiprocketNickname: buildShiprocketNickname(vendor._id, id),
            isDefault: true,
            createdAt: new Date(),
        }

        await db.get().collection(collections.VENDORS).updateOne(
            { _id: vendor._id },
            { $set: { pickupAddresses: [address] } }
        )
        await syncPickupToShiprocket(vendor, address)
        return [address]
    },

    async addAddress(vendorId, payload) {
        const vendor = await this.getVendorDoc(vendorId)
        if (!vendor) throw new Error('vendor_not_found')

        const data = normalizeAddress(payload)
        if (!data.pinCode || !data.address || !data.city || !data.state) {
            throw new Error('invalid_pickup_address')
        }

        const id = newAddressId()
        const list = Array.isArray(vendor.pickupAddresses) ? [...vendor.pickupAddresses] : []
        if (data.isDefault) {
            list.forEach((a) => { a.isDefault = false })
        }
        if (list.length === 0) data.isDefault = true

        const address = {
            id,
            ...data,
            shiprocketNickname: buildShiprocketNickname(vendorId, id),
            createdAt: new Date(),
        }
        list.push(address)

        await db.get().collection(collections.VENDORS).updateOne(
            { _id: ObjectId(vendorId) },
            { $set: { pickupAddresses: list } }
        )
        await syncPickupToShiprocket(vendor, address)
        return address
    },

    async updateAddress(vendorId, addressId, payload) {
        const vendor = await this.getVendorDoc(vendorId)
        if (!vendor) throw new Error('vendor_not_found')

        const list = Array.isArray(vendor.pickupAddresses) ? [...vendor.pickupAddresses] : []
        const idx = list.findIndex((a) => a.id === addressId)
        if (idx < 0) throw new Error('address_not_found')

        const merged = { ...list[idx], ...normalizeAddress({ ...list[idx], ...payload }) }
        if (merged.isDefault) {
            list.forEach((a) => { a.isDefault = false })
        }
        list[idx] = merged

        await db.get().collection(collections.VENDORS).updateOne(
            { _id: ObjectId(vendorId) },
            { $set: { pickupAddresses: list } }
        )
        await syncPickupToShiprocket(vendor, merged)
        return merged
    },

    async deleteAddress(vendorId, addressId) {
        const vendor = await this.getVendorDoc(vendorId)
        if (!vendor) throw new Error('vendor_not_found')

        const list = (vendor.pickupAddresses || []).filter((a) => a.id !== addressId)
        if (list.length > 0 && !list.some((a) => a.isDefault)) {
            list[0].isDefault = true
        }

        await db.get().collection(collections.VENDORS).updateOne(
            { _id: ObjectId(vendorId) },
            { $set: { pickupAddresses: list } }
        )
        return list
    },

    async resolvePickup(vendorId, pickupAddressId) {
        const addresses = await this.getAddresses(vendorId)
        if (!addresses.length) {
            throw new Error('no_pickup_addresses')
        }
        const found = addresses.find((a) => a.id === pickupAddressId)
            || addresses.find((a) => a.isDefault)
            || addresses[0]

        return {
            pickupAddressId: found.id,
            pickupLabel: found.label,
            pickupPinCode: found.pinCode,
            pickup_location: found.shiprocketNickname || buildShiprocketNickname(vendorId, found.id),
        }
    },

    async applyToProductBody(body, vendorId, { requirePickup = true } = {}) {
        const isDraft = body.publishStatus === 'draft'
        if (isDraft && !body.pickupAddressId) {
            return body
        }

        const pickupAddressId = body.pickupAddressId
        if (!pickupAddressId && requirePickup && !isDraft) {
            throw new Error('pickup_address_required')
        }
        if (!pickupAddressId) return body

        const resolved = await this.resolvePickup(vendorId, pickupAddressId)
        body.pickupAddressId = resolved.pickupAddressId
        body.pickupLabel = resolved.pickupLabel
        body.pickupPinCode = resolved.pickupPinCode
        body.pickup_location = resolved.pickup_location
        return body
    },
}

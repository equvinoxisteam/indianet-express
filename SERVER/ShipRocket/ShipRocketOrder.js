import axiosLib from "axios";
let axios = axiosLib.default;
import qs from 'qs'

function buildOrderParams(obj, payment) {
    return qs.stringify({
        "order_id": obj.secretOrderId,
        "order_date": new Date(),
        "channel_id": "",
        "pickup_location": obj.pickup_location,
        "billing_customer_name": obj.details.name,
        "billing_last_name": " ",
        "billing_address": obj.details.address,
        "billing_address_2": obj.details.locality,
        "billing_city": obj.details.city,
        "billing_pincode": obj.details.pin,
        "billing_state": obj.details.state,
        "billing_country": "India",
        "billing_email": obj.details.email,
        "billing_phone": obj.details.number,
        "shipping_is_billing": 1,
        "order_items": [{
            selling_price: obj.selling_price,
            name: `${obj.proName} ${obj.variantSize === 'S' ||
                obj.variantSize === 'M' || obj.variantSize === 'L' ||
                obj.variantSize === 'XL' ? 'Size ' + obj.variantSize : ''}`,
            sku: obj.product.toString(),
            discount: obj.discount,
            tax: obj.gstAmount ?? 0,
            hsn: 121,
            units: obj.quantity,
        }],
        "payment_method": payment,
        "shipping_charges": obj.shippingAmount ?? 0,
        "giftwrap_charges": 0,
        "transaction_charges": 0,
        "total_discount": 0,
        "sub_total": obj.price,
        "length": obj.lengthCm ?? 10,
        "breadth": obj.breadthCm ?? 15,
        "height": obj.heightCm ?? 20,
        "weight": obj.weightKg ?? 2.5
    }).toString()
}

export default (payment, products, token) => {
    return new Promise(async (resolve, reject) => {
        try {
            await Promise.all(products.map(async (obj, key) => {
                const params = buildOrderParams(obj, payment)
                const url = `https://apiv2.shiprocket.in/v1/external/orders/create/adhoc?${params}`

                const response = await axios({
                    method: "POST",
                    url,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    redirect: "follow",
                }).catch(() => null)

                if (response?.status === 200) {
                    products[key].order_id_shiprocket = response.data.order_id
                    products[key].shipment_id = response.data.shipment_id
                } else {
                    products[key].order_id_shiprocket = null
                    products[key].shipment_id = null
                }
            }))
            resolve(products)
        } catch (err) {
            reject(err)
        }
    })
}

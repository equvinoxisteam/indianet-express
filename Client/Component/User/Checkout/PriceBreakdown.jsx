function PriceBreakdown({ amount }) {
    if (!amount || !amount.totalPrice) return null

    const subtotal = amount.subtotal ?? Math.max(0, (amount.totalPrice ?? 0) - (amount.platformFees ?? 0) - (amount.shippingAmount ?? 0) - (amount.gstAmount ?? 0))
    const commissionPct = amount.commissionPercent ?? 15
    const fixedFee = amount.fixedFeePerLine ?? 30
    const gstPct = amount.gstPercent ?? 18

    return (
        <div className='AmtDiv'>
            <div>
                <p>Product subtotal</p>
                <p>Platform fee ({commissionPct}% + ₹{fixedFee}/item)</p>
                <p>Shipping (Shiprocket)</p>
                <p>GST ({gstPct}% on products)</p>
                <p>Discount</p>
                <p>MRP</p>
                <h6 className='font-bold'>Total payable</h6>
            </div>
            <div>
                <p>₹ {subtotal}</p>
                <p>₹ {amount.platformFees ?? 0}</p>
                <p>₹ {amount.shippingAmount ?? 0}</p>
                <p>₹ {amount.gstAmount ?? 0}</p>
                <p>− ₹ {amount.totalDiscount ?? 0}</p>
                <p>₹ {amount.totalMrp ?? 0}</p>
                <h6 className='font-bold'>₹ {amount.totalPrice}</h6>
            </div>
        </div>
    )
}

export default PriceBreakdown

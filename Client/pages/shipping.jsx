import Footer from '@/Component/User/Footer/Footer'
import Header from '@/Component/User/Header/Header'
import Head from 'next/head'
import React, { Fragment } from 'react'
import { BRAND_NAME } from '@/Config/brand'

function Shipping() {
    return (
        <Fragment>
            <Head>
                <title>{BRAND_NAME} — Shipping &amp; Delivery</title>
                <meta name="description" content={`Shipping and delivery information for ${BRAND_NAME} orders across India.`} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <main style={{ background: '#f4f7fa', minHeight: '100vh' }}>
                <Header />
                
                <section style={{ background: 'linear-gradient(135deg, #1A3C5E 0%, #102A43 100%)', padding: '50px 0' }}>
                    <div className="container">
                        <h1 className="text-white font-bold mb-0">Shipping &amp; Delivery</h1>
                        <p className="text-white opacity-75 mt-2">Pan-India delivery powered by Shiprocket</p>
                    </div>
                </section>

                <div className="container py-5">
                    <div className="row">
                        <div className="col-12 col-lg-10 mx-auto">
                            <div className="bg-white p-4 p-md-5 rounded shadow-sm border" style={{ borderRadius: '16px' }}>
                                <div className="policy-section mb-5">
                                    <h4 className="font-bold mb-3" style={{ color: '#1A3C5E' }}>1. Delivery coverage</h4>
                                    <p className="text-muted text-small" style={{ lineHeight: '1.7' }}>
                                        {BRAND_NAME} delivers across India via Shiprocket courier partners. Serviceability is checked at checkout
                                        using your PIN code. If your area is serviceable, shipping charges are calculated automatically based on
                                        product weight, dimensions, and distance from the seller&apos;s pickup location.
                                    </p>
                                </div>

                                <div className="policy-section mb-5">
                                    <h4 className="font-bold mb-3" style={{ color: '#1A3C5E' }}>2. How shipping charges work</h4>
                                    <p className="text-muted text-small" style={{ lineHeight: '1.7' }}>
                                        Your cart may include items from multiple sellers. Each seller ships from their own warehouse PIN code,
                                        so shipping is estimated per seller and summed at checkout. GST (18%) is applied on the product subtotal.
                                        The final amount is shown before you pay.
                                    </p>
                                </div>

                                <div className="policy-section mb-5">
                                    <h4 className="font-bold mb-3" style={{ color: '#1A3C5E' }}>3. Estimated delivery time</h4>
                                    <ul className="text-muted text-small" style={{ lineHeight: '2' }}>
                                        <li><strong>Metro cities:</strong> 3–5 business days after dispatch</li>
                                        <li><strong>Other locations:</strong> 5–10 business days after dispatch</li>
                                        <li><strong>Remote areas:</strong> May take longer depending on courier availability</li>
                                    </ul>
                                </div>

                                <div className="policy-section mb-5">
                                    <h4 className="font-bold mb-3" style={{ color: '#1A3C5E' }}>4. Order tracking</h4>
                                    <p className="text-muted text-small" style={{ lineHeight: '1.7' }}>
                                        Once the seller packs and ships your order, you receive email and WhatsApp updates. Track your order from
                                        <strong> My Account → Orders</strong>. AWB and courier details appear when Shiprocket assigns a pickup.
                                    </p>
                                </div>

                                <div className="policy-section mb-5">
                                    <h4 className="font-bold mb-3" style={{ color: '#1A3C5E' }}>5. Damaged or missing items</h4>
                                    <p className="text-muted text-small" style={{ lineHeight: '1.7' }}>
                                        Inspect your package on delivery. Report damage, wrong items, or shortages within 48 hours to
                                        {' '}<a href="mailto:team@equvinoxis.com">team@equvinoxis.com</a> with photos and your order ID.
                                    </p>
                                </div>

                                <div className="p-4 rounded text-center" style={{ background: 'rgba(26, 60, 94, 0.04)', border: '1px dashed #1A3C5E' }}>
                                    <p className="text-muted text-small mb-0">
                                        Shipping help: <a href="mailto:team@equvinoxis.com" style={{ color: '#1A3C5E', fontWeight: 'bold' }}>team@equvinoxis.com</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </main>

            <style jsx>{`
                .policy-section h4 { border-bottom: 2px solid #f0f4f8; padding-bottom: 0.5rem; }
            `}</style>
        </Fragment>
    )
}

export default Shipping

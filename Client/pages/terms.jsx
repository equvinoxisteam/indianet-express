import Footer from '@/Component/User/Footer/Footer'
import Header from '@/Component/User/Header/Header'
import Head from 'next/head'
import React, { Fragment } from 'react'
import { BRAND_NAME } from '@/Config/brand'

function Terms() {
    return (
        <Fragment>
            <Head>
                <title>{BRAND_NAME} — Terms &amp; Conditions</title>
                <meta name="description" content={`Terms & Conditions for using ${BRAND_NAME}.`} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <main style={{ background: '#f4f7fa', minHeight: '100vh' }}>
                <Header />
                
                <section style={{ background: 'linear-gradient(135deg, #1A3C5E 0%, #102A43 100%)', padding: '50px 0' }}>
                    <div className="container">
                        <h1 className="text-white font-bold mb-0">Terms &amp; Conditions</h1>
                        <p className="text-white opacity-75 mt-2">Effective June 2026</p>
                    </div>
                </section>

                <div className="container py-5">
                    <div className="row">
                        <div className="col-12 col-lg-10 mx-auto">
                            <div className="bg-white p-4 p-md-5 rounded shadow-sm border" style={{ borderRadius: '16px' }}>
                                <div className="policy-section mb-5">
                                    <h4 className="font-bold mb-3" style={{ color: '#1A3C5E' }}>1. About {BRAND_NAME}</h4>
                                    <p className="text-muted text-small" style={{ lineHeight: '1.7' }}>
                                        {BRAND_NAME} is a multi-vendor e-commerce marketplace operated by Equvinoxis. Buyers can browse products,
                                        place orders, pay online or via cash on delivery, and receive shipments across India. Sellers list products
                                        and fulfill orders through our platform.
                                    </p>
                                </div>

                                <div className="policy-section mb-5">
                                    <h4 className="font-bold mb-3" style={{ color: '#1A3C5E' }}>2. Buyer terms</h4>
                                    <p className="text-muted text-small" style={{ lineHeight: '1.7' }}>
                                        You must provide accurate delivery address and contact details. Prices shown include product cost;
                                        shipping and GST are calculated at checkout. Orders are binding once payment is confirmed (or COD is accepted).
                                        Delivery times depend on seller processing and courier partners (Shiprocket).
                                    </p>
                                </div>

                                <div className="policy-section mb-5">
                                    <h4 className="font-bold mb-3" style={{ color: '#1A3C5E' }}>3. Seller terms</h4>
                                    <p className="text-muted text-small" style={{ lineHeight: '1.7' }}>
                                        Sellers must register, be approved by admin, and list only genuine products with accurate descriptions,
                                        images, weight, and dimensions. Sellers are responsible for packing and handing over shipments for pickup.
                                        {BRAND_NAME} does not charge subscription fees for standard seller accounts on Express.
                                    </p>
                                </div>

                                <div className="policy-section mb-5">
                                    <h4 className="font-bold mb-3" style={{ color: '#1A3C5E' }}>4. Payments &amp; refunds</h4>
                                    <p className="text-muted text-small" style={{ lineHeight: '1.7' }}>
                                        Online payments are processed securely via Razorpay. COD orders must be collected at delivery.
                                        Refunds for cancelled or undelivered orders are handled per our support policy. Contact
                                        {' '}<a href="mailto:team@equvinoxis.com">team@equvinoxis.com</a> within 48 hours of delivery issues.
                                    </p>
                                </div>

                                <div className="policy-section mb-5">
                                    <h4 className="font-bold mb-3" style={{ color: '#1A3C5E' }}>5. Limitation of liability</h4>
                                    <p className="text-muted text-small" style={{ lineHeight: '1.7' }}>
                                        {BRAND_NAME} facilitates transactions between buyers and independent sellers. We are not the manufacturer
                                        of listed goods. Disputes regarding product quality should first be raised with the seller and our support team.
                                    </p>
                                </div>

                                <div className="p-4 rounded text-center" style={{ background: 'rgba(26, 60, 94, 0.04)', border: '1px dashed #1A3C5E' }}>
                                    <p className="text-muted text-small mb-0">
                                        Questions? Contact <a href="mailto:team@equvinoxis.com" style={{ color: '#1A3C5E', fontWeight: 'bold' }}>team@equvinoxis.com</a>
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

export default Terms

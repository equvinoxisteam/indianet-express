import Footer from '@/Component/User/Footer/Footer'
import Header from '@/Component/User/Header/Header'
import Head from 'next/head'
import React, { Fragment } from 'react'
import style from './company.module.scss'

const features = [
    {
        icon: 'fa-solid fa-shield-halved',
        title: 'Verified Sellers',
        text: 'Every vendor passes business verification so buyers can source machinery and equipment with confidence.',
    },
    {
        icon: 'fa-solid fa-globe',
        title: 'Global Reach',
        text: 'Connect with buyers and suppliers across markets — list once and grow your brand internationally.',
    },
    {
        icon: 'fa-solid fa-headset',
        title: 'Dedicated Support',
        text: 'Our team helps with onboarding, listings, RFQs, and account questions whenever you need guidance.',
    },
    {
        icon: 'fa-solid fa-industry',
        title: 'Built for B2B',
        text: 'Catalogues, bulk enquiries, RFQ workflows, and vendor tools designed for industrial trade — not retail.',
    },
]

function Company() {
    return (
        <Fragment>
            <Head>
                <title>About Indianet Express — Shop Industrial Products Online</title>
                <meta name="description" content="Learn about Indianet — the B2B marketplace built for brands, vendors, and industrial buyers." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <main className={style.page}>
                <Header />

                <section className={style.hero}>
                    <div className="container">
                        <h1>About Indianet Express</h1>
                        <p>
                            Your trusted industrial e-commerce store — browse machinery and parts, order online, and get reliable delivery across India.
                        </p>
                    </div>
                </section>

                <div className={`container ${style.content}`}>
                    <div className="row justify-content-center">
                        <div className="col-12 col-lg-10">
                            <div className={style.card}>
                                <section className="mb-5">
                                    <h2 className={style.sectionTitle}>Our Mission</h2>
                                    <p className={style.missionText}>
                                        Indianet exists to make B2B commerce simpler for manufacturers, distributors, and buyers.
                                        We give vendors a professional storefront to showcase industrial products, manage RFQs, and reach new customers —
                                        while giving buyers a single trusted place to discover machinery, compare suppliers, and place enquiries with confidence.
                                        Our goal is to help every brand on the platform trade smarter, scale faster, and build lasting business relationships.
                                    </p>
                                </section>

                                <section>
                                    <h2 className={style.sectionTitle}>Why Choose Indianet?</h2>
                                    <div className={style.featureGrid}>
                                        {features.map((item) => (
                                            <div className={style.featureItem} key={item.title}>
                                                <div className={style.featureIcon}>
                                                    <i className={item.icon}></i>
                                                </div>
                                                <div className={style.featureBody}>
                                                    <h6>{item.title}</h6>
                                                    <p>{item.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>

                <Footer />
            </main>
        </Fragment>
    )
}

export default Company

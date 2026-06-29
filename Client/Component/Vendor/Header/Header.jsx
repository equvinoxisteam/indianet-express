import { useRouter } from 'next/router'
import React, { Fragment, useContext, useState } from 'react'
import Link from 'next/link'
import BrandLogo from '@/Component/Common/BrandLogo'
import ContentControl from '../../../ContentControl/ContentControl'
import toast from 'react-hot-toast';

const vendorNavItems = [
    {
        label: 'Overview',
        items: [
            { href: '/vendor/dashboard', icon: 'fa-solid fa-gauge', label: 'Dashboard' },
        ]
    },
    {
        label: 'Catalogue',
        items: [
            { href: '/vendor/products', icon: 'fa-solid fa-box-open', label: 'My Products' },
        ]
    },
    {
        label: 'Commerce',
        items: [
            { href: '/vendor/orders', icon: 'fa-solid fa-shopping-bag', label: 'Orders' },
        ]
    },
    {
        label: 'Account',
        items: [
            { href: '/vendor/plans', icon: 'fa-solid fa-gem', label: 'Plans' },
            { href: '/vendor/settings', icon: 'fa-solid fa-gear', label: 'Settings' },
        ]
    },
]

function Header() {
    const { setVendorLogged } = useContext(ContentControl)
    const router = useRouter()
    const [mobileOpen, setMobileOpen] = useState(false)

    const isActive = (href) => router.pathname === href || router.pathname.startsWith(href + '/')
    const currentItem = vendorNavItems.flatMap((s) => s.items).find((i) => isActive(i.href))
    const pageLabel = currentItem?.label || 'Dashboard'

    const handleLogout = () => {
        setVendorLogged({ status: false })
        localStorage.removeItem('vendorToken')
        toast.error('Logged out')
        router.push('/vendor/login')
    }

    const handleBack = () => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back()
            return
        }
        router.push('/vendor/dashboard')
    }

    return (
        <Fragment>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                        zIndex: 999
                    }}
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`VendorSidebar${mobileOpen ? ' open' : ''}`}>
                <Link href="/vendor/dashboard" className="sidebarLogo">
                    <BrandLogo variant="light" href={null} />
                    <span className="logoBadge">Seller</span>
                </Link>

                <nav className="sidebarNav">
                    {vendorNavItems.map((section) => (
                        <div key={section.label}>
                            <span className="navLabel">{section.label}</span>
                            {section.items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`navLink${isActive(item.href) ? ' active' : ''}`}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <i className={item.icon}></i>
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="sidebarFooter">
                    <button className="logoutBtn" onClick={handleLogout}>
                        <i className="fa-solid fa-right-from-bracket"></i>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Topbar */}
            <header className="VendorTopbar">
                <div className="topbarLeft">
                    <button type="button" className="vendorBackBtn" onClick={handleBack} aria-label="Go back">
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <button
                        className="mobileMenuBtn"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        <i className="fa-solid fa-bars"></i>
                    </button>
                    <div className="pageBreadcrumb">
                        Seller Portal &nbsp;/&nbsp;
                        <span>
                            {pageLabel}
                        </span>
                    </div>
                </div>
                <div className="topbarRight" aria-hidden="true" />
            </header>

        </Fragment>
    )
}

export default Header
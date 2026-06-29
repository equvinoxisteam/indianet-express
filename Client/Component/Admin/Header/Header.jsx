import React, { Fragment, useState } from 'react'
import Link from 'next/link'
import BrandLogo from '@/Component/Common/BrandLogo'
import { useRouter } from 'next/router'

const adminNavItems = [
    {
        label: 'Main',
        items: [
            { href: '/admin/dashboard', icon: 'fa-solid fa-gauge', label: 'Dashboard' },
        ]
    },
    {
        label: 'Catalogue',
        items: [
            { href: '/admin/products', icon: 'fa-solid fa-box', label: 'Products' },
            { href: '/admin/categories', icon: 'fa-solid fa-tags', label: 'Categories' },
        ]
    },
    {
        label: 'Commerce',
        items: [
            { href: '/admin/orders', icon: 'fa-solid fa-shopping-bag', label: 'Orders' },
            { href: '/admin/settlements', icon: 'fa-solid fa-indian-rupee-sign', label: 'Settlements' },
            { href: '/admin/cupons', icon: 'fa-solid fa-ticket', label: 'Coupons' },
        ]
    },
    {
        label: 'Management',
        items: [
            { href: '/admin/vendors', icon: 'fa-solid fa-store', label: 'Vendors' },
            { href: '/admin/layouts', icon: 'fa-solid fa-layer-group', label: 'Layouts' },
        ]
    },
]

function Header() {
    const router = useRouter()
    const [mobileOpen, setMobileOpen] = useState(false)

    const isActive = (href) => router.pathname === href || router.pathname.startsWith(href + '/')

    return (
        <Fragment>
            {/* Overlay for mobile */}
            {mobileOpen && (
                <div
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                        zIndex: 999, display: 'block'
                    }}
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`AdminSidebar${mobileOpen ? ' open' : ''}`}>
                {/* Logo */}
                <Link href="/admin/dashboard" className="sidebarLogo">
                    <BrandLogo variant="light" href={null} />
                    <span className="logoBadge">Admin</span>
                </Link>

                {/* Nav */}
                <nav className="sidebarNav">
                    {adminNavItems.map((section) => (
                        <div className="navSection" key={section.label}>
                            <p className="navLabel">{section.label}</p>
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

                {/* Footer */}
                <div className="sidebarFooter">
                    <Link
                        href="/admin/login"
                        className="logoutBtn"
                        onClick={() => localStorage.removeItem('adminToken')}
                    >
                        <i className="fa-solid fa-right-from-bracket"></i>
                        Logout
                    </Link>
                </div>
            </aside>

            {/* Topbar */}
            <header className="AdminTopbar">
                <div className="topbarLeft">
                    <button
                        className="mobileMenuBtn"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        <i className="fa-solid fa-bars"></i>
                    </button>
                    <div className="breadcrumb">
                        Admin Panel &nbsp;/&nbsp;
                        <span>
                            {adminNavItems.flatMap(s => s.items).find(i => isActive(i.href))?.label || 'Dashboard'}
                        </span>
                    </div>
                </div>
                <div className="topbarRight">
                    <Link href="/admin/dashboard" className="topbarBtn" title="Dashboard">
                        <i className="fa-solid fa-gauge"></i>
                    </Link>
                    <div className="adminAvatar">A</div>
                </div>
            </header>

        </Fragment>
    )
}

export default Header
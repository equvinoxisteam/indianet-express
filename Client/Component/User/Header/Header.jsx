import React, { Fragment } from 'react'
import { useState, useContext, useEffect, useMemo } from 'react'
import Link from 'next/link'
import MenuBar from '../MenuBar/MenuBar'
import style from './Header.module.scss'
import ContentControl from '../../../ContentControl/ContentControl'
import Login from '../Login/Login'
import { ServerId } from '@/Config/Server'
import BrandLogo from '@/Component/Common/BrandLogo'
import PromoBar from './PromoBar'
import { useRouter } from 'next/router'

function getVisibleCategoryCount(width, total) {
    if (total <= 0) return 0
    if (width >= 1400) return total
    if (width >= 1200) return Math.min(4, total)
    if (width >= 992) return Math.min(3, total)
    if (width >= 850) return Math.min(2, total)
    return Math.min(1, total)
}

function CategoryMegaPanel({ category }) {
    return (
        <div className={style.megaMenuInner}>
            <div className={style.megaMenuScroll}>
                <div className={style.megaMenuGrid}>
                    {category.mainSub?.map((obj2, key2) => (
                        <div className={style.megaMenuCol} key={key2}>
                            <Link className={style.categoryHead} href={`/c/${obj2.slug}`}>
                                <i className="fa-solid fa-circle-dot"></i>
                                <span>{obj2.name}</span>
                            </Link>
                            <div className={style.subList}>
                                {category.sub?.map((obj3, key3) => {
                                    if (obj2.slug === obj3.mainSubSlug) {
                                        return (
                                            <Link className={style.categoryItem} href={`/c/${obj3.slug}`} key={key3}>
                                                {obj3.name}
                                            </Link>
                                        )
                                    }
                                    return null
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function BrowseAllMegaPanel({ categories }) {
    return (
        <div className={style.megaMenuInner}>
            <div className={style.megaMenuScroll}>
                <div className={style.megaMenuGrid}>
                    {categories.map((obj, key) => (
                        <div className={style.megaMenuCol} key={key}>
                            <Link className={style.categoryHead} href={`/c/${obj.slug}`}>
                                <i className="fa-solid fa-circle-dot"></i>
                                <span>{obj.name}</span>
                            </Link>
                            <div className={style.subList}>
                                {obj.mainSub?.map((obj2, key2) => (
                                    <Link className={style.categoryItem} href={`/c/${obj2.slug}`} key={key2}>
                                        {obj2.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function Header() {

    const [menuBar, setMenuBar] = useState({
        active: false,
        btn: false,
        categories: [],
        categoryOpen: false
    })

    const [timeDate, setTimeDate] = useState('')

    const { userLogged, setUserLogged,
        LoginModal, setLoginModal, cartTotal, cartCount, wishlistCount,
        allCategories, headerCategories, refreshHeaderCounts } = useContext(ContentControl)

    const [search, setSearch] = useState('')
    const navigate = useRouter()

    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [navWidth, setNavWidth] = useState(1200)

    const visibleCategoryCount = useMemo(
        () => getVisibleCategoryCount(navWidth, headerCategories.length),
        [navWidth, headerCategories.length]
    )
    const visibleCategories = headerCategories.slice(0, visibleCategoryCount)
    const moreCategories = headerCategories.slice(visibleCategoryCount)

    function SearchSubmit(e) {
        e.preventDefault()
        setShowSuggestions(false)
        navigate.push(`/search?name=${search}`);
    }

    const handleSearchInput = (e) => {
        const value = e.target.value;
        setSearch(value);
        if (value.length > 2) {
            // Recommendation logic - Filter from categories or recent searches
            const filtered = allCategories.filter(c => 
                c.name.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 5);
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }

    function openLoginModal(member = true) {
        setLoginModal({
            ...LoginModal,
            member,
            forgot: false,
            btn: true,
            active: true
        })
    }

    function goAccount() {
        if (userLogged.status) {
            navigate.push('/account')
        } else {
            openLoginModal(true)
        }
    }

    function goCart() {
        if (userLogged.status) {
            navigate.push('/cart')
        } else {
            openLoginModal(true)
        }
    }

    function goWishlist() {
        if (userLogged.status) {
            navigate.push('/wishlist')
        } else {
            openLoginModal(true)
        }
    }

    function goOrders() {
        if (userLogged.status) {
            navigate.push('/orders')
        } else {
            openLoginModal(true)
        }
    }

    function alignMegaMenu(e) {
        const li = e.currentTarget
        const panel = li.querySelector('[data-mega-panel]')
        if (!panel) return

        const liRect = li.getBoundingClientRect()
        const margin = 12
        const alignRight = panel.dataset.megaAlign === 'right'
        const maxW = alignRight
            ? Math.min(300, window.innerWidth - margin * 2)
            : Math.min(920, window.innerWidth - margin * 2)

        let offsetLeft = alignRight ? liRect.width - maxW : 0

        if (!alignRight) {
            const overflowRight = liRect.left + maxW - (window.innerWidth - margin)
            if (overflowRight > 0) offsetLeft -= overflowRight
            const overflowLeft = liRect.left + offsetLeft - margin
            if (overflowLeft < 0) offsetLeft -= overflowLeft
        } else {
            const overflowLeft = liRect.left + offsetLeft - margin
            if (overflowLeft < 0) offsetLeft -= overflowLeft
            const overflowRight = liRect.left + offsetLeft + maxW - (window.innerWidth - margin)
            if (overflowRight > 0) offsetLeft -= overflowRight
        }

        panel.style.width = `${maxW}px`
        panel.style.left = `${offsetLeft}px`
    }

    useEffect(() => {
        const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        let time = `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
        let today = `${weekday[new Date().getDay()]} ${month[new Date().getMonth()]} ${new Date().getDate()} ${new Date().getFullYear()}`

        const timer = setTimeout(() => {
            setTimeDate(`${today} ${time}`)
        }, 1000)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        const onResize = () => setNavWidth(window.innerWidth)
        onResize()
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    return (
        <Fragment>
            {
                LoginModal.active && <Login LoginModal={LoginModal} setLoginModal={setLoginModal} />
            }
            {menuBar.active && <MenuBar menuBar={{ ...menuBar, categories: allCategories }} setMenuBar={setMenuBar} />}
            <PromoBar />
            <header className={style.siteHeader}>
                <div className={style.UserHeadDesk}>
                    <div className={style.subTop}>
                        <div className="container">
                            <div className={style.topFlex}>
                                <div className={style.topLeft}>
                                    <Link href="/help" className={style.topHelpLink}>
                                        <i className="fa-solid fa-circle-question"></i>
                                        <span>Help &amp; Support</span>
                                    </Link>
                                </div>
                                <div className={style.topRight}>
                                    <span className={style.dateTime}>{timeDate}</span>
                                    {
                                        userLogged.status && (
                                            <button className={style.logoutBtn} onClick={() => {
                                                localStorage.removeItem('token')
                                                setUserLogged({ status: false })
                                                navigate.push('/')
                                            }}>
                                                <i className="fa-solid fa-right-from-bracket"></i>
                                                Logout
                                            </button>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={style.main}>
                        <div className="container">
                            <div className={style.mainRow}>
                                <div className={style.logoCol}>
                                    <BrandLogo href="/" />
                                </div>
                                <div className={style.searchCol}>
                                    <div className={style.searchContainer}>
                                        <form onSubmit={SearchSubmit} className='d-flex position-relative'>
                                            <div className='flex-grow-1 position-relative' style={{ width: '100%' }}>
                                                <input 
                                                    className={style.searchBox} 
                                                    required 
                                                    placeholder='Search for products, brands and more...'
                                                    type='text' 
                                                    value={search} 
                                                    onInput={handleSearchInput}
                                                    onFocus={() => search.length > 2 && setShowSuggestions(true)}
                                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                                />
                                                <button className={style.searchBtn} type="submit">
                                                    <i className="fa-solid fa-magnifying-glass"></i>
                                                </button>

                                                {showSuggestions && suggestions.length > 0 && (
                                                    <div className={style.suggestionPanel}>
                                                        <div className='p-3 text-xs font-bold text-muted border-bottom bg-light' style={{ letterSpacing: '0.05em' }}>RECOMMENDED FOR YOU</div>
                                                        {suggestions.map((s, i) => (
                                                            <div key={i} className={style.suggestionItem} onClick={() => {
                                                                setSearch(s.name);
                                                                setShowSuggestions(false);
                                                                navigate.push(`/search?name=${s.name}`);
                                                            }}>
                                                                <div className='d-flex align-items-center justify-content-between w-100'>
                                                                    <span>
                                                                        <i className="fa-solid fa-magnifying-glass me-3 text-muted" style={{ fontSize: '0.8rem' }}></i>
                                                                        {s.name}
                                                                    </span>
                                                                    <i className="fa-solid fa-chevron-right text-muted" style={{ fontSize: '0.7rem' }}></i>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </form>
                                    </div>
                                </div>
                                <div className={style.actionsCol}>
                                    <div className={style.headerActionsRow}>
                                        <button type="button" className={style.iconActionBtn} onClick={goWishlist} aria-label="Wishlist" title="Wishlist">
                                            <i className="fa-regular fa-heart"></i>
                                            {wishlistCount > 0 && <span className={style.iconBadge}>{wishlistCount}</span>}
                                        </button>
                                        <button type="button" className={style.iconActionBtn} onClick={goCart} aria-label="Cart" title="Cart">
                                            <i className="fa-solid fa-cart-shopping"></i>
                                            {cartCount > 0 && <span className={style.iconBadge}>{cartCount}</span>}
                                        </button>
                                        {userLogged.status ? (
                                            <>
                                                <button type="button" className={style.ordersBtn} onClick={goOrders} title="My Orders">
                                                    <i className="fa-solid fa-box"></i>
                                                    <span>Orders</span>
                                                </button>
                                                <button type="button" className={style.accountBtn} onClick={goAccount}>
                                                    {userLogged.profileImage ? (
                                                        <img
                                                            className={style.actionAvatar}
                                                            src={`${ServerId}/user/${userLogged._id}/${userLogged.profileImage}`}
                                                            alt=""
                                                        />
                                                    ) : (
                                                        <i className="fa-solid fa-user"></i>
                                                    )}
                                                    <span className={style.accNameMax}>{userLogged.name}</span>
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button type="button" className={style.signInBtn} onClick={() => openLoginModal(true)}>
                                                    <i className="fa-solid fa-right-to-bracket"></i>
                                                    <span>Sign In</span>
                                                </button>
                                                <Link href="/vendor/register" className={style.signInBtn}>
                                                    <i className="fa-solid fa-store"></i>
                                                    <span>Sell Now</span>
                                                </Link>
                                                <button type="button" className={style.signUpBtn} onClick={() => openLoginModal(false)}>
                                                    Join Free
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                <div className={style.sub}>
                    <div className="container">
                        <ul className={`d-flex align-items-center list-unstyled mb-0 ${style.navList}`}>
                            <li>
                                <Link className={style.mainNavLink} href={'/'}>
                                    <i className="fa-solid fa-house-chimney me-2 text-primary opacity-75"></i>
                                    Home
                                </Link>
                            </li>
                            <li className={style.hasMegaMenu} onMouseEnter={alignMegaMenu}>
                                <div className={style.catDropdownBtn}>
                                    <i className="fa-solid fa-grid-2 me-2"></i>
                                    Browse All
                                    <i className="fa-solid fa-chevron-down ms-2 opacity-50 text-xs text-white"></i>
                                </div>
                                <div className={style.showCategories} data-mega-panel>
                                    <BrowseAllMegaPanel categories={allCategories} />
                                    <div className={style.megaMenuFooter}>
                                        <button
                                            type='button'
                                            onClick={() => navigate.push('/c/' + (allCategories[0]?.slug || ''))}
                                            className={style.megaMenuFooterBtn}
                                        >
                                            Browse all categories <i className="fa-solid fa-arrow-right-long ms-2"></i>
                                        </button>
                                    </div>
                                </div>
                            </li>
                            {visibleCategories.map((obj, key) => (
                                <li key={key} className={style.hasMegaMenu} onMouseEnter={alignMegaMenu}>
                                    <Link href={`/c/${obj.slug}`} className={style.mainNavLink}>
                                        <span className={style.navLinkText}>{obj.name}</span>
                                        <i className="fa-solid fa-chevron-down ms-1 opacity-50" style={{ fontSize: '0.6rem' }}></i>
                                    </Link>
                                    <div className={style.showCategories} data-mega-panel>
                                        <CategoryMegaPanel category={obj} />
                                    </div>
                                </li>
                            ))}
                            {moreCategories.length > 0 && (
                                <li className={style.hasMegaMenu} onMouseEnter={alignMegaMenu}>
                                    <span className={style.mainNavLink + ' ' + style.moreNavBtn}>
                                        <span className={style.navLinkText}>More</span>
                                        <i className="fa-solid fa-chevron-down ms-1 opacity-50" style={{ fontSize: '0.6rem' }}></i>
                                    </span>
                                    <div className={style.showCategories + ' ' + style.moreDropdown} data-mega-panel data-mega-align="right">
                                        <div className={style.megaMenuInner}>
                                            <div className='py-3 px-3'>
                                                <p className={style.moreDropdownTitle}>More Categories</p>
                                                <div className={style.moreGrid}>
                                                    {moreCategories.map((obj, key) => (
                                                        <Link key={key} className={style.moreItem} href={`/c/${obj.slug}`}>
                                                            <i className="fa-solid fa-folder-open me-2"></i>
                                                            {obj.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            <div className={style.UserHeadMob}>
                <div className={style.subTop}>
                    <div className={style.mobTopUtility}>
                        <i className="fa-solid fa-truck-fast"></i>
                        <span>Worldwide Delivery</span>
                    </div>
                    {
                        userLogged.status && (
                            <button className={style.logoutBtnMob} onClick={() => {
                                localStorage.removeItem('token')
                                setUserLogged({ status: false })
                                navigate.push('/')
                            }}>
                                Logout
                            </button>
                        )
                    }
                </div>

                <div className={style.MainMob}>
                    <div className="container">
                        <div className={style.mobTopRow}>
                            <div className={style.mobLeftGroup}>
                                <button className={style.MobMenuBar} type="button" onClick={() => {
                                    setMenuBar({
                                        ...menuBar,
                                        active: true,
                                        btn: true,
                                        categories: headerCategories
                                    })
                                }} aria-label="Open menu">
                                    <i className="fa-solid fa-bars UserBlackMain"></i>
                                </button>
                                <BrandLogo href="/" />
                            </div>
                            <div className={style.mobActions}>
                                <button type="button" className={style.mobIconBtn} onClick={goWishlist} aria-label="Wishlist">
                                    <i className="fa-regular fa-heart UserBlackMain"></i>
                                    {wishlistCount > 0 && <span className={style.mobBadge}>{wishlistCount}</span>}
                                </button>
                                <button type="button" className={style.mobIconBtn} onClick={goCart} aria-label="Cart">
                                    <i className="fa-solid fa-cart-shopping UserBlackMain"></i>
                                    {cartCount > 0 && <span className={style.mobBadge}>{cartCount}</span>}
                                </button>
                                <button type="button" className={style.mobIconBtn} onClick={goAccount} aria-label="Account">
                                    {userLogged.status && userLogged.profileImage ? (
                                        <img
                                            src={`${ServerId}/user/${userLogged._id}/${userLogged.profileImage}`}
                                            alt=""
                                            className={style.mobAvatar}
                                        />
                                    ) : (
                                        <i className="fa-solid fa-user UserBlackMain"></i>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={style.subBottumMob}>
                    <div className="container pt-2 pb-2">
                        <form onSubmit={SearchSubmit} className={style.mobSearchForm}>
                            <input className={style.searchBox} required placeholder='Search products, sellers...'
                                type='text' value={search} onInput={(e) => {
                                    setSearch(e.target.value)
                                }} />
                            <button className={style.searchBtn} type="submit">
                                <i className="fa-solid fa-magnifying-glass"></i>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </header>
    </Fragment>
    )
}

export default Header
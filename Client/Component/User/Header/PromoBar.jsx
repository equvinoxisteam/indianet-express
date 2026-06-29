import Link from 'next/link'
import style from './PromoBar.module.scss'
import { BRAND_NAME } from '@/Config/brand'

function PromoBar() {
    return (
        <div className={style.promoBar}>
            <div className="container">
                <div className={style.promoInner}>
                    <div className={style.promoLeft}>
                        <i className="fa-solid fa-truck-fast" />
                        <span>Pan-India delivery via Shiprocket</span>
                    </div>
                    <div className={style.promoCenter}>
                        <span className={style.promoHighlight}>Welcome to {BRAND_NAME}</span>
                        <span className={style.promoDot}>·</span>
                        <span>Order online · Pay securely · Track your shipment</span>
                    </div>
                    <div className={style.promoRight}>
                        <Link href="/orders">Track Order</Link>
                        <Link href="/help">Support</Link>
                        <Link href="/vendor/register">Sell on {BRAND_NAME}</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PromoBar

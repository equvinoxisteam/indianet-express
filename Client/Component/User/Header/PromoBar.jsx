import style from './PromoBar.module.scss'
import { BRAND_NAME } from '@/Config/brand'

function PromoBar() {
    return (
        <div className={style.promoBar}>
            <div className="container">
                <div className={style.promoInner}>
                    <div className={style.promoLeft}>
                        <i className="fa-solid fa-truck-fast" />
                        <span>Worldwide delivery — fast &amp; secure shipping</span>
                    </div>
                    <div className={style.promoCenter}>
                        <span className={style.promoHighlight}>Welcome to {BRAND_NAME}</span>
                        <span className={style.promoDot}>·</span>
                        <span>Order online · Pay securely · Sign in to track orders</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PromoBar

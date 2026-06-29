import Link from 'next/link'
import { ServerId } from '@/Config/Server'
import style from './HomePost.module.scss'

function formatFromPrice(price) {
    if (price == null || price <= 0) return null
    return `from ₹${Number(price).toLocaleString('en-IN')}*`
}

function ShopGrid({ categories = [], title = 'SHOP', subTitle = '' }) {
    const items = (categories || []).filter((c) => c?._id && c?.file?.filename)

    if (items.length === 0) return null

    return (
        <section className={style.shopSection}>
            <div className={style.shopSectionInner}>
                <div className={style.shopSectionHeader}>
                    <h2 className={style.shopTitle}>{title}</h2>
                    {subTitle ? <p className={style.shopSubtitle}>{subTitle}</p> : null}
                </div>
                <div className={style.shopGrid}>
                    {items.map((cat) => (
                        <Link
                            key={cat._id}
                            href={`/c/${cat.slug}`}
                            className={`LinkTagNonDec ${style.shopCard}`}
                        >
                            <div className={style.shopCardImage}>
                                <img
                                    src={`${ServerId}/category/${cat.uni_id1}${cat.uni_id2}/${cat.file.filename}`}
                                    alt={cat.name}
                                    loading="lazy"
                                />
                            </div>
                            <div className={style.shopCardBody}>
                                <h3 className={style.shopCardName}>{cat.name}</h3>
                                {formatFromPrice(cat.minPrice) ? (
                                    <p className={style.shopCardPrice}>{formatFromPrice(cat.minPrice)}</p>
                                ) : cat.productCount > 0 ? (
                                    <p className={style.shopCardPrice}>{cat.productCount} products</p>
                                ) : (
                                    <p className={style.shopCardPrice}>Explore</p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
                <div className={style.shopSectionFooter}>
                    <Link href="/categories" className={style.shopViewAll}>
                        View all categories <i className="fa-solid fa-arrow-right-long ms-2" />
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default ShopGrid

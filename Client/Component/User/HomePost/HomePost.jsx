import React from 'react'
import style from './HomePost.module.scss'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from "swiper";
import 'swiper/css';
import 'swiper/css/navigation';
import { useRef } from 'react';
import { useContext } from 'react';
import Link from 'next/link';
import Server, { ServerId, userAxios } from '@/Config/Server';
import ContentControl from '@/ContentControl/ContentControl';
import toast from 'react-hot-toast';
import CategoryPath from '@/Component/Common/CategoryPath';
import ShopGrid from './ShopGrid';

function HomePost({ layout, shopCategories = [] }) {
    const sectionfour = layout?.sectionfour || { title: '', subTitle: '', items: [], items2: [] }
    const sectionone = layout?.sectionone || { title: '', subTitle: '', items: [] }
    const sectiontwo = layout?.sectiontwo || { title: '', subTitle: '', items: [], items2: [] }
    const sectionthree = layout?.sectionthree || { title: '', subTitle: '', items: [], items2: [] }
    const sliderTwo = layout?.sliderTwo || { items: [], for: 'product' }
    const banner = layout?.banner || { file: { filename: '' }, link: '' }

    const sliderTwoRef = useRef(null)

    const {
        setQuickVw, QuickVw,
        setUserLogged, setLoginModal, setCartTotal
    } = useContext(ContentControl)

    function LogOut() {
        setUserLogged({
            status: false
        })
        localStorage.removeItem('token')
    }

    const validItems = (items) => (items || []).filter((obj) => obj?._id !== undefined)
    const catItems = validItems(sectionone.items)
    const shopItems = shopCategories.length > 0
        ? shopCategories
        : catItems.map((c) => ({ ...c, minPrice: null, productCount: 0 }))
    const sectionTwoItems = validItems(sectiontwo.items)
    const sectionThreeItems = validItems(sectionthree.items)
    const sectionFourItems = validItems(sectionfour.items)
    const slider2Items = (sliderTwo.items || []).filter((obj) => obj?.file?.filename)

    return (
        <div className={style.HomePost}>
            <ShopGrid
                categories={shopItems}
                title={sectionone.title || 'SHOP'}
                subTitle={sectionone.subTitle || 'Browse categories and order online with fast delivery across India'}
            />

            {/* SECTION 2 - Products */}
            {sectionTwoItems.length > 0 && (
            <div className={style.sectionFullWidthBg}>
                <div className={style.fullWidthContainer}>
                    <div className={style.sectionHeader}>
                        <h2 className='text-center font-bold UserBlackMain mb-2'>{sectiontwo.title}</h2>
                        <p className='text-center UserGrayMain mx-auto' style={{ maxWidth: '600px' }}>{sectiontwo.subTitle}</p>
                    </div>
                    <div className={style.productsGridFullWidth}>
                        <Swiper
                            autoplay={{
                                delay: 4000,
                                disableOnInteraction: false,
                            }}
                            modules={[Autoplay]}
                            spaceBetween={20}
                            breakpoints={{
                                0: { slidesPerView: 2 },
                                768: { slidesPerView: 3 },
                                992: { slidesPerView: 4 },
                                1205: { slidesPerView: 5 },
                            }}
                        >
                            {sectionTwoItems.map((obj, key) => {
                                if (obj._id !== undefined) {
                                    return (
                                        <SwiperSlide key={key}>
                                            <div className={style.UserMainProCard}>
                                                <div className={style.UserMainProimgDiv}>
                                                    {obj.discount > 0 && <span className={style.offerGreen}>{obj.discount}% OFF</span>}
                                                    <Link href={`/p/${obj.slug}/${obj._id}`}>
                                                        <img
                                                            src={`${ServerId}/product/${obj.uni_id_1}${obj.uni_id_2}/${obj.files[0].filename}`}
                                                            loading="lazy" alt={obj.name}
                                                        />
                                                    </Link>
                                                    <button type="button" className={style.QuickViewDiv} onClick={() => {
                                                        Server.get('/users/product/' + obj.slug + '/' + obj._id).then((item) => {
                                                            setQuickVw({ ...QuickVw, active: true, btn: true, product: item.data.product });
                                                        }).catch(() => toast.error('Error'));
                                                    }}>
                                                        Quick View
                                                    </button>
                                                </div>
                                                <Link href={`/p/${obj.slug}/${obj._id}`} className="LinkTagNonDec">
                                                    <div className={style.textArea}>
                                                        <CategoryPath category={obj.category} variant="card" />
                                                        <h6 className={style.proName + ' oneLineTxt'}>{obj.name}</h6>
                                                        <div className={style.PriceSpan}>
                                                            {obj.allowRfq === true ? (
                                                                <span className={style.sale}>RFQ Product</span>
                                                            ) : (
                                                                <>
                                                                    <span className={style.sale}>₹ {obj.price}</span>
                                                                    <span className={style.mrp}>₹ {obj.mrp}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        </SwiperSlide>
                                    )
                                } else {
                                    return null
                                }
                            })}
                        </Swiper>
                    </div>
                </div>
            </div>
            )}

            {/* Slider Two - Full Width Banner Slider */}
            {slider2Items.length > 0 && (
            <div className={style.sliderTwoContainer}>
                <div className={style.sliderTwoNavPrev} id='slider2-nav-prev'>
                    <i className="fa-solid fa-chevron-left"></i>
                </div>
                <div className={style.sliderTwoNavNext} id='slider2-nav-next'>
                    <i className="fa-solid fa-chevron-right"></i>
                </div>
                <Swiper
                    ref={sliderTwoRef}
                    autoplay={{
                        delay: 4000,
                        disableOnInteraction: false,
                    }}
                    modules={[Autoplay, Navigation]}
                    navigation={{
                        prevEl: '#slider2-nav-prev',
                        nextEl: '#slider2-nav-next',
                    }}
                    spaceBetween={0}
                    slidesPerView={1}
                    loop={true}
                    className={style.sliderTwoSwiper}
                >
                    {slider2Items.map((obj, key) => {
                        return (
                            <SwiperSlide key={key}>
                                <div 
                                    className={style.sliderTwoSlide}
                                    style={{ 
                                        backgroundImage: obj.file ? `url(${ServerId}/${sliderTwo.for}/${obj.uni_id}/${obj.file.filename})` : 'none',
                                        backgroundColor: '#f8fafc'
                                    }}
                                    onClick={() => {
                                        if (obj.link) {
                                            window.open(obj.link, '_blank')
                                        }
                                    }}
                                >
                                </div>
                            </SwiperSlide>
                        )
                    })}
                </Swiper>
            </div>
            )}

            {
                banner?.file?.filename && (
                    <div className="UserMainBgGrey">
                        <div className="container p-4">
                            <div className={style.bannerContainer}>
                                <img 
                                    className={`${style.bannerImage} rounded`}
                                    src={`${ServerId}/banner/${banner.file.filename}`}
                                    onClick={() => {
                                        window.open(banner.link, '_blank')
                                    }}
                                    loading="lazy" 
                                    alt="banner"
                                />
                            </div>
                        </div>
                    </div>
                )
            }

            {/* SECTION 3 - Products - Full Width */}
            {sectionThreeItems.length > 0 && (
            <div className={style.sectionFullWidthBg}>
                <div className={style.sectionHeader}>
                    <h2 className='text-center font-bold UserBlackMain mb-2'>{sectionthree.title}</h2>
                    <p className='text-center UserGrayMain mx-auto' style={{ maxWidth: '600px' }}>{sectionthree.subTitle}</p>
                </div>
                <div className={style.productsGridFullWidth}>
                    <Swiper
                        autoplay={{
                            delay: 4000,
                            disableOnInteraction: false,
                        }}
                        modules={[Autoplay]}
                        spaceBetween={20}
                        breakpoints={{
                            0: { slidesPerView: 2 },
                            768: { slidesPerView: 3 },
                            992: { slidesPerView: 4 },
                            1205: { slidesPerView: 5 },
                        }}
                    >
                        {sectionThreeItems.map((obj, key) => {
                            if (obj._id !== undefined) {
                                return (
                                    <SwiperSlide key={key}>
                                            <div className={style.UserMainProCard}>
                                                <div className={style.UserMainProimgDiv}>
                                                    {obj.discount > 0 && <span className={style.offerGreen}>{obj.discount}% OFF</span>}
                                                <Link href={`/p/${obj.slug}/${obj._id}`}>
                                                    <img
                                                        src={`${ServerId}/product/${obj.uni_id_1}${obj.uni_id_2}/${obj.files[0].filename}`}
                                                        loading="lazy" alt={obj.name}
                                                    />
                                                </Link>
                                                <button type="button" className={style.QuickViewDiv} onClick={() => {
                                                    Server.get('/users/product/' + obj.slug + '/' + obj._id).then((item) => {
                                                        setQuickVw({ ...QuickVw, active: true, btn: true, product: item.data.product });
                                                    }).catch(() => toast.error('Error'));
                                                }}>
                                                    Quick View
                                                </button>
                                            </div>

                                            <Link href={`/p/${obj.slug}/${obj._id}`} className="LinkTagNonDec">
                                                <div className={style.textArea}>
                                                    <CategoryPath category={obj.category} variant="card" />
                                                    <h6 className={style.proName + ' oneLineTxt'}>{obj.name}</h6>
                                                    <div className={style.PriceSpan}>
                                                        {obj.allowRfq === true ? (
                                                            <span className={style.sale}>RFQ Product</span>
                                                        ) : (
                                                            <>
                                                                <span className={style.sale}>₹ {obj.price}</span>
                                                                <span className={style.mrp}>₹ {obj.mrp}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    </SwiperSlide>
                                )
                            } else {
                                return null
                            }

                        })}
                    </Swiper>
                </div>
            </div>
            )}

            {/* SECTION 4 - Products - Full Width */}
            {sectionFourItems.length > 0 && (
            <div className={style.sectionFullWidth}>
                <div className={style.sectionHeader}>
                    <h2 className='text-center font-bold UserBlackMain mb-2'>{sectionfour.title}</h2>
                    <p className='text-center UserGrayMain mx-auto' style={{ maxWidth: '600px' }}>{sectionfour.subTitle}</p>
                </div>
                <div className={style.productsGridFullWidth}>
                    <Swiper
                        autoplay={{
                            delay: 4000,
                            disableOnInteraction: false,
                        }}
                        modules={[Autoplay]}
                        spaceBetween={20}
                        breakpoints={{
                            0: { slidesPerView: 2 },
                            768: { slidesPerView: 3 },
                            992: { slidesPerView: 4 },
                            1205: { slidesPerView: 5 },
                        }}
                    >
                            {sectionFourItems.map((obj, key) => (
                                <SwiperSlide key={key}>
                                    <div className={style.UserMainProCard}>
                                        <div className={style.UserMainProimgDiv}>
                                            {obj.discount > 0 && <span className={style.offerGreen}>{obj.discount}% OFF</span>}
                                            <Link href={`/p/${obj.slug}/${obj._id}`}>
                                                <img
                                                    src={`${ServerId}/product/${obj.uni_id_1}${obj.uni_id_2}/${obj.files[0].filename}`}
                                                    loading="lazy" alt={obj.name}
                                                />
                                            </Link>
                                            <button type="button" className={style.QuickViewDiv} onClick={() => {
                                                Server.get('/users/product/' + obj.slug + '/' + obj._id).then((item) => {
                                                    setQuickVw({ ...QuickVw, active: true, btn: true, product: item.data.product });
                                                }).catch(() => toast.error('Error'));
                                            }}>
                                                Quick View
                                            </button>
                                        </div>
                                        <Link href={`/p/${obj.slug}/${obj._id}`} className="LinkTagNonDec">
                                            <div className={style.textArea}>
                                                <CategoryPath category={obj.category} variant="card" className="oneLineTxt" />
                                                <h6 className={style.proName + ' oneLineTxt'} title={obj.name}>{obj.name}</h6>
                                                <div className={style.PriceSpan}>
                                                    {obj.allowRfq === true ? (
                                                        <span className={style.sale}>RFQ Product</span>
                                                    ) : (
                                                        <>
                                                            <span className={style.sale}>₹ {obj.price}</span>
                                                            <span className={style.mrp}>₹ {obj.mrp}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                </SwiperSlide>
                            ))}

                        </Swiper>
                </div>
            </div>
            )}
        </div>
    )
}

export default HomePost
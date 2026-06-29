import { useEffect, useState, useContext, useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Thumbs, Autoplay, Pagination, Navigation } from 'swiper'
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import Link from 'next/link'
import ContentControl from '../../../ContentControl/ContentControl'
import Server, { ServerId, userAxios } from '../../../Config/Server'
import ReviewModal from './ReviewModal'
import CheckPinModal from './CheckPinModal'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import CategoryPath, { splitCategoryPath } from '@/Component/Common/CategoryPath';

function VendorLogoAvatar({ logo, size = 60 }) {
  const url = logo ? `${ServerId}${logo}` : null
  return (
    <div
      className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden${url ? '' : ' bg-primary'}`}
      style={{ width: size, height: size, minWidth: size }}
    >
      {url ? (
        <img src={url} alt="" className="w-100 h-100" style={{ objectFit: 'cover' }} />
      ) : (
        <i className="fa-solid fa-store text-white" style={{ fontSize: '1.8rem' }} />
      )}
    </div>
  )
}

function ProductComp() {
  const {
    OrderDetails, setOrderDetails,
    setQuickVw, QuickVw,
    ImgModal, setImgModal,
    product = {}, similar = [], userLogged, setUserLogged,
    setLoginModal, setCartTotal, setOrderType, setProduct
  } = useContext(ContentControl)

  const navigate = useRouter()

  const [detailTab, setDetailTab] = useState('description')

  const [showReviewModal, setShowReviewModal] = useState({
    btn: false,
    active: false
  })

  const [reviews, setReviews] = useState({
    total: 0,
    reviews: [],
    userReview: false,
    stars: {
      one: 0,
      two: 0,
      three: 0,
      four: 0,
      five: 0,
      onePerc: 0,
      twoPerc: 0,
      threePerc: 0,
      fourPerc: 0,
      fivePerc: 0,
      rating: 0
    }
  })

  // Safe checks for product properties
  const images = product?.files || [];
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const [magnifier, setMagnifier] = useState(false);
  const [[x, y], setXY] = useState([0, 0]);
  const [[imgWidth, imgHeight], setSize] = useState([0, 0]);

  const magnifierHeight = 150;
  const magnifieWidth = 150;
  const zoomLevel = 2;

  const [selectedVariantId, setSelectedVariantId] = useState('');

  // Initialize flags safely
  const canRfq = false;
  const variants = Array.isArray(product?.variant) ? product.variant : [];
  const selectedVariant = variants.find((v) => (v.id || v._id) === selectedVariantId) || variants[0] || null;
  const selectedVariantLabel = selectedVariant
    ? (selectedVariant.size === 'Other' ? (selectedVariant.customSize || 'Custom') : selectedVariant.size)
    : (product?.currVariantSize || 'Standard');
  const vendorProfileId =
    product?.vendorId ||
    (typeof product?.vendor === 'string' ? product.vendor : product?.vendor?._id) ||
    ''
  const hasVendorProfile = typeof vendorProfileId === 'string' && vendorProfileId.length === 24
  const showCompanyProfile = product?.showCompanyProfile === true
  const verifiedVendorBadge = product?.verifiedVendorBadge === true
  const canLinkStorefront = product?.canLinkStorefront === true
  const vendorLogo = product?.vendorLogo || ''
  // For RFQ items, we never show buy/cart actions (privacy).
  const canBuyOnline = !canRfq && product?.allowOnline !== false;
  const canBuyCod = !canRfq && product?.allowCod !== false;
  const canPurchase = canBuyOnline || canBuyCod;
  const rfqInfoItems = [
    ['Availability', product?.available === 'true' ? 'Available' : 'Unavailable'],
    ['Cancellation', product?.cancellation === 'true' ? 'Available' : 'Unavailable'],
    ['Return', product?.return === 'true' ? 'Available' : 'Unavailable'],
  ];

  const getVariantImageName = (variant) => {
    const candidates = [
      ...(Array.isArray(variant?.images) ? variant.images : []),
      ...(Array.isArray(variant?.variantFiles) ? variant.variantFiles : []),
    ];

    for (const item of candidates) {
      if (typeof item === 'string' && item.trim()) return item;
      if (item && typeof item === 'object') {
        if (typeof item.filename === 'string' && item.filename.trim()) return item.filename;
        if (typeof item.name === 'string' && item.name.trim()) return item.name;
      }
    }

    return product?.files?.[0]?.filename || '';
  };

  useEffect(() => {
    if (variants.length === 0) {
      setSelectedVariantId('');
      return;
    }
    const activeVariant = variants.find((v) => v.active) || variants[0];
    setSelectedVariantId(activeVariant?.id || activeVariant?._id || '');
  }, [product?._id]);

  function copyURL() {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied');
    }
  }

  function LogOut() {
    setUserLogged(user => ({
      ...user,
      status: false,
    }))
    localStorage.removeItem('token')
  }

  function getReviews() {
    Server.get('/users/getReviews', {
      params: {
        proId: product._id,
        userId: userLogged._id || '',
      }
    }).then((res) => {
      setReviews({
        total: res.data.total,
        reviews: res.data.reviews,
        userReview: res.data.userReview,
        stars: res.data.stars
      })
    }).catch(() => {
      setDetailTab('description')
      toast.error('Error to Get Reviews')
    })
  }

  const activePrice = selectedVariant?.price ?? product?.price ?? 0
  const activeMrp = selectedVariant?.mrp ?? product?.mrp ?? 0

  function addToCart() {
    if (!userLogged.status) {
      setLoginModal({ btn: true, active: true, member: true, forgot: false })
      return
    }
    userAxios((server) => {
      server.post('/users/addToCart', {
        item: {
          quantity: 1,
          proId: product._id,
          price: activePrice,
          mrp: activeMrp,
          variantSize: selectedVariantLabel || product.currVariantSize || '',
        },
      }).then((res) => {
        if (res.data.login) {
          LogOut()
          setLoginModal({ btn: true, active: true, member: true, forgot: false })
        } else if (res.data.found) {
          toast.error('Already in cart')
        } else {
          toast.success('Added to cart')
          setCartTotal((amt) => amt + Number(activePrice))
        }
      }).catch(() => toast.error('Could not add to cart'))
    })
  }

  function buyNow() {
    if (!userLogged.status) {
      setLoginModal({ btn: true, active: true, member: true, forgot: false })
      return
    }
    setOrderType({
      order: true,
      type: 'buy',
      proId: product._id,
      quantity: 1,
      buyDetails: {
        proId: product._id,
        price: activePrice,
        mrp: activeMrp,
        variantSize: selectedVariantLabel || product.currVariantSize || '',
      },
    })
    navigate.push('/checkout')
  }

  useEffect(() => {
    getReviews()
  }, [userLogged])

  function loadMoreReviews() {
    Server.get('/users/loadMoreReviews', {
      params: {
        proId: product._id,
        skip: reviews['reviews'].length
      }
    }).then((res) => {
      setReviews({
        ...reviews,
        total: res.data.total,
        reviews: [...reviews.reviews, ...res.data.reviews]
      })
    }).catch(() => {
      toast.error('Error to Load More Reviews')
    })
  }

  function deleteReview() {
    Swal.fire({
      title: 'Do you want delete review',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes'
    }).then((result) => {
      if (result.isConfirmed) {
        userAxios((server) => {
          server.delete('/users/deleteReview', {
            data: { proId: product._id }
          }).then((res) => {
            if (res.data.login) {
              LogOut();
              setLoginModal({ btn: true, active: true, member: true, forgot: false });
            } else {
              getReviews();
              toast.success("Review Deleted");
            }
          }).catch(() => toast.error("Error to delete review"));
        });
      }
    });
  }

  return (
    <>
      {showReviewModal.active && <ReviewModal product={product} setShowReviewModal={setShowReviewModal} getReviews={getReviews} />}
      
      <div className='ProductComp singleProduct'>
        <div className="container">
          <div className="row pb-5 pt-4">
            {/* Left Column: Image Gallery */}
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="ProductGallery sticky-top" style={{ top: '112px' }}>
                <Swiper
                  modules={[Thumbs]}
                  thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                  className="MainImage mb-3"
                >
                  {images && images.map((item, key) => (
                    <SwiperSlide key={key}>
                      <div className="MainImageContainer glass-card">
                        <img 
                          src={`${ServerId}/product/${product.uni_id_1}${product.uni_id_2}/${item.filename}`} 
                          alt={product.name}
                          className="img-fluid w-100 h-100"
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                <Swiper
                  onSwiper={setThumbsSwiper}
                  spaceBetween={10}
                  slidesPerView={4}
                  watchSlidesProgress={true}
                  modules={[Thumbs]}
                  className="ThumbnailSwiper"
                >
                  {images && images.map((item, key) => (
                    <SwiperSlide key={key} className="cursor-pointer">
                      <div className="ThumbContainer glass-card p-1">
                        <img 
                          src={`${ServerId}/product/${product.uni_id_1}${product.uni_id_2}/${item.filename}`} 
                          alt={product.name}
                          className="img-fluid rounded"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>

            {/* Right Column: Product Details */}
            <div className="col-lg-6">
              <div className="ProductDetail glass-card p-4">
                <nav aria-label="breadcrumb" className="mb-2">
                  <ol className="breadcrumb mb-0 product-category-breadcrumb">
                    <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                    {splitCategoryPath(product.category).map((part, index, parts) => (
                      <li
                        key={`${part}-${index}`}
                        className={`breadcrumb-item${index === parts.length - 1 ? ' active' : ''}`}
                        aria-current={index === parts.length - 1 ? 'page' : undefined}
                      >
                        {part}
                      </li>
                    ))}
                  </ol>
                </nav>
                <h1 className="h2 font-bold mb-2 text-dark d-flex flex-wrap align-items-center gap-2">
                  {product.name}
                  {verifiedVendorBadge && (
                    <span className="verifiedVendorBadge">
                      <i className="fa-solid fa-circle-check" aria-hidden="true" />
                      Verified vendor
                    </span>
                  )}
                </h1>
                <div className="d-flex align-items-center mb-3">
                  <div className="Badge bg-light text-dark me-3">
                    <span className="fa fa-star text-warning me-1"></span>
                    {reviews.stars.rating} ({reviews.total} Reviews)
                  </div>
                  {product.available === 'true' ? (
                    <span className="text-success small fw-bold"><i className="fa-solid fa-circle-check me-1"></i> In Stock</span>
                  ) : (
                    <span className="text-danger small fw-bold"><i className="fa-solid fa-circle-xmark me-1"></i> Out of Stock</span>
                  )}
                </div>

                <div className="PriceSection mb-4">
                  <h2 className="text-primary font-bold mb-0">₹ {selectedVariant?.price ?? product.price}</h2>
                  <div className="text-muted small">
                    <del className="me-2">₹ {selectedVariant?.mrp ?? product.mrp}</del>
                    {product.discount > 0 && (
                      <span className="badge bg-danger-subtle text-danger">Save {product.discount}%</span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="font-bold mb-2">Short Description</h6>
                  <div className="text-secondary small text-break" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }} dangerouslySetInnerHTML={{ __html: product.srtDescription }}></div>
                </div>

                {variants.length > 0 && (
                  <div className="VariantSection mb-4">
                    <h6 className="font-bold mb-2">Available Variants</h6>
                    <div className="variantGrid">
                      {variants.map((variant, idx) => {
                        const variantId = variant.id || variant._id || `v-${idx}`;
                        const label = variant.size === 'Other' ? (variant.customSize || 'Custom') : variant.size;
                        const isActive = selectedVariantId === variantId;
                        const variantImage = getVariantImageName(variant);
                        return (
                          <button
                            key={variantId}
                            type="button"
                            className={isActive ? 'variantCard active' : 'variantCard'}
                            onClick={() => setSelectedVariantId(variantId)}
                          >
                            {variantImage ? (
                              <img
                                src={`${ServerId}/product/${product.uni_id_1}${product.uni_id_2}/${variantImage}`}
                                alt={label}
                                className="variantThumb"
                              />
                            ) : (
                              <div className="variantThumb d-flex align-items-center justify-content-center text-muted small">
                                No image
                              </div>
                            )}
                            <span className="variantName">{label}</span>
                            <span className="variantPrice">₹{variant.price || product.price}</span>
                            {variant.mrp ? <span className="variantMrp">₹{variant.mrp}</span> : null}
                          </button>
                        );
                      })}
                    </div>
                    {selectedVariant?.details && (
                      <div className="small text-secondary mt-2" style={{ whiteSpace: 'pre-wrap' }}>
                        {selectedVariant.details}
                      </div>
                    )}
                  </div>
                )}

                <div className="ActionButtons d-grid gap-3">
                  {product.available === 'true' && canPurchase && (
                    <>
                      <button type="button" className="btn btn-primary rounded-pill font-bold py-2" onClick={addToCart}>
                        <i className="fa-solid fa-cart-plus me-2" /> Add to Cart
                      </button>
                      <button type="button" className="btn btn-dark rounded-pill font-bold py-2" onClick={buyNow}>
                        Buy Now
                      </button>
                    </>
                  )}

                  {!canPurchase && product.available === 'true' && (
                    <div className="alert alert-info py-2 small mb-0">
                      Contact support for purchasing terms.
                    </div>
                  )}

                  {product.available === 'false' && (
                    <button className="btn btn-secondary rounded-pill font-bold py-2" disabled>
                      Currently Unavailable
                    </button>
                  )}
                </div>

                <div className="ProductMetadata border-top mt-4 pt-4 d-flex gap-4">
                    <div className="small">
                      <span className="text-muted d-block">COD Available</span>
                      {canBuyCod ? <span className="text-success fw-bold">Yes</span> : <span className="text-danger fw-bold">No</span>}
                    </div>
                    <div className="small">
                      <span className="text-muted d-block">Online Pay</span>
                      {canBuyOnline ? <span className="text-success fw-bold">Yes</span> : <span className="text-danger fw-bold">No</span>}
                    </div>
                    <div className="small">
                      <span className="text-muted d-block">Returns</span>
                      {product.return === 'true' ? <span className="text-success fw-bold">7 Days</span> : <span className="text-danger fw-bold">No</span>}
                    </div>
                  </div>
                </div>
            </div>
          </div>

          <div className='DescAndReviews glass-card mb-5'>
            <div className='btns p-3 border-bottom d-flex flex-wrap gap-1'>
              <button type="button" className={detailTab === 'description' ? 'active-btn btn btn-sm' : 'btn btn-sm'} onClick={() => setDetailTab('description')}>Description</button>
              {canRfq && (
                <button type="button" className={detailTab === 'specifications' ? 'active-btn btn btn-sm' : 'btn btn-sm'} onClick={() => setDetailTab('specifications')}>Specifications</button>
              )}
              {canRfq && (
                <button type="button" className={detailTab === 'packaging' ? 'active-btn btn btn-sm' : 'btn btn-sm'} onClick={() => setDetailTab('packaging')}>Delivery details</button>
              )}
              {canRfq && (
                <button type="button" className={detailTab === 'certificates' ? 'active-btn btn btn-sm' : 'btn btn-sm'} onClick={() => setDetailTab('certificates')}>Certificates</button>
              )}
              <button type="button" className={detailTab === 'reviews' ? 'active-btn btn btn-sm' : 'btn btn-sm'} onClick={() => {
                setDetailTab('reviews')
                getReviews()
              }}>Reviews</button>
              {canRfq && hasVendorProfile && (
                <button type="button" className={detailTab === 'supplier' ? 'active-btn btn btn-sm' : 'btn btn-sm'} onClick={() => setDetailTab('supplier')}>Supplier</button>
              )}
            </div>

            <div className="p-4 detailPanel">
              <div className='description text-break' style={{ display: detailTab === 'description' ? 'block' : 'none', wordBreak: 'break-word', overflowWrap: 'break-word' }} dangerouslySetInnerHTML={{ __html: product.description }}>
              </div>

              {canRfq && (
                <div className="detailSection specsSection" style={{ display: detailTab === 'specifications' ? 'block' : 'none' }}>
                  <h6 className="font-bold mb-3">Key attributes</h6>
                  {product.rfqAttributes && product.rfqAttributes.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-bordered table-sm align-middle specTable">
                        <tbody>
                          {product.rfqAttributes.map((attr, index) => (
                            <tr key={index}>
                              <th className="bg-light text-muted small" style={{ width: '32%' }}>{attr.key}</th>
                              <td className="small">{attr.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted small">No attributes listed for this product.</p>
                  )}
                </div>
              )}

              {canRfq && (
                <div className="detailSection" style={{ display: detailTab === 'packaging' ? 'block' : 'none' }}>
                  <h6 className="font-bold mb-3">Delivery details</h6>
                  {product.rfqHandlingTime && (
                    <div className="mb-3">
                      <h6 className="font-bold small">Handling time</h6>
                      <p className="small text-secondary mb-0" style={{ whiteSpace: 'pre-wrap' }}>{product.rfqHandlingTime}</p>
                    </div>
                  )}
                  {product.rfqCustomization && (
                    <div className="mb-3">
                      <h6 className="font-bold small">Customization options</h6>
                      <p className="small text-secondary mb-0" style={{ whiteSpace: 'pre-wrap' }}>{product.rfqCustomizationDesc || 'Available — contact for details.'}</p>
                    </div>
                  )}
                  {product.rfqLeadTime && (
                    <div>
                      <h6 className="font-bold small">Lead time</h6>
                      <p className="small text-secondary mb-0" style={{ whiteSpace: 'pre-wrap' }}>{product.rfqLeadTime}</p>
                    </div>
                  )}
                  <div className="rfqMetaGrid mt-3">
                    <div className="rfqMetaCard">
                      <span className="rfqMetaLabel">Weight (kg)</span>
                      <span className="rfqMetaValue">{product.weightKg || '-'}</span>
                    </div>
                    <div className="rfqMetaCard">
                      <span className="rfqMetaLabel">Length (cm)</span>
                      <span className="rfqMetaValue">{product.lengthCm || '-'}</span>
                    </div>
                    <div className="rfqMetaCard">
                      <span className="rfqMetaLabel">Breadth (cm)</span>
                      <span className="rfqMetaValue">{product.breadthCm || '-'}</span>
                    </div>
                    <div className="rfqMetaCard">
                      <span className="rfqMetaLabel">Height (cm)</span>
                      <span className="rfqMetaValue">{product.heightCm || '-'}</span>
                    </div>
                  </div>
                </div>
              )}

              {canRfq && (
                <div className="detailSection" style={{ display: detailTab === 'certificates' ? 'block' : 'none' }}>
                  <h6 className="font-bold mb-3">Certificates</h6>
                  {product.rfqCertificates && product.rfqCertificates.length > 0 ? (
                    <ul className="list-unstyled mb-0">
                      {product.rfqCertificates.map((c, i) => (
                        <li key={i} className="mb-3 pb-3 border-bottom">
                          {typeof c === 'string' ? (
                            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">{c}</span>
                          ) : (
                            <>
                              <div className="fw-bold">{c.name || 'Certificate'}</div>
                              {c.description && <div className="small text-secondary mt-1">{c.description}</div>}
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted small">No certificates listed.</p>
                  )}
                </div>
              )}

              <div className='reviews' style={{ display: detailTab === 'reviews' ? 'block' : 'none' }}>
                <div className="ReviewRating mb-4">
                  <div className="row align-items-center">
                    <div className="col-md-4 text-center border-end">
                      <h2 className='UserBlackMain font-bold pt-2 mb-0'>
                        {reviews['stars'].rating}
                        <span className='fa fa-star text-warning ms-1'></span>
                      </h2>
                      <h6 className='text-small text-muted mb-3'>{reviews.total} Reviews</h6>
                      {userLogged.status ? (
                        reviews['userReview'] ? (
                          <div className='small'>
                            To update, <span className='text-primary cursor-pointer' onClick={() => deleteReview()}>delete</span> old review.
                          </div>
                        ) : (
                          <button className='btn btn-sm btn-primary px-4' onClick={() => setShowReviewModal({ btn: true, active: true })}>Add Review</button>
                        )
                      ) : (
                        <div className='small'>
                          <span className='text-primary cursor-pointer' onClick={() => setLoginModal({ btn: true, active: true, member: true, forgot: false })}>Login</span> to post a review.
                        </div>
                      )}
                    </div>

                    <div className="col-md-8 px-lg-5">
                      {[5, 4, 3, 2, 1].map(star => (
                        <div className="row align-items-center mb-1" key={star}>
                          <div className="col-2 text-end small">{star} <i className="fa fa-star text-warning"></i></div>
                          <div className="col-8">
                            <div className="progress" style={{ height: '8px' }}>
                              <div className="progress-bar bg-warning" style={{ width: `${reviews['stars'][['zero','one','two','three','four','five'][star] + 'Perc']}%` }}></div>
                            </div>
                          </div>
                          <div className="col-2 small text-muted">{reviews['stars'][['zero','one','two','three','four','five'][star]]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="ReviewsList">
                  {reviews['reviews'] && reviews['reviews'].length !== 0 ? (
                    <>
                      {reviews['reviews'].map((obj, key) => (
                        <div key={key} className="cardReview border-bottom py-3">
                          <div className="d-flex justify-content-between mb-2">
                            <div className="badge bg-success-subtle text-success">
                              {obj.starInNum} <i className="fa fa-star text-success"></i>
                            </div>
                            {userLogged.status && userLogged._id === obj.userId && (
                              <button className='btn btn-link btn-sm text-danger p-0' onClick={() => deleteReview()}>Delete</button>
                            )}
                          </div>
                          <h6 className='font-bold small mb-1'>{obj.title}</h6>
                          <div className="small text-secondary text-break" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{obj.review}</div>
                        </div>
                      ))}
                      {parseInt(reviews.total) !== reviews['reviews'].length && (
                        <button className='btn btn-link btn-sm w-100 mt-3' onClick={() => loadMoreReviews()}>Load More</button>
                      )}
                    </>
                  ) : (
                    <p className='text-muted small text-center py-4'>No reviews yet.</p>
                  )}
                </div>
              </div>

              {canRfq && product.vendor && product.vendor !== false && (
                <div style={{ display: detailTab === 'supplier' ? 'block' : 'none' }}>
                  <h6 className="font-bold mb-3">Supplier</h6>
                  <div className="vendor-info-card bg-light p-4 rounded">
                    <div className="row align-items-center g-3">
                      <div className="col-lg-8">
                        <div className="d-flex align-items-start gap-3">
                          <VendorLogoAvatar logo={vendorLogo} />
                          <div className="flex-grow-1">
                            <h5 className="font-bold mb-2 d-flex flex-wrap align-items-center gap-2">
                              {product.vendorName || 'Vendor'}
                              {verifiedVendorBadge && (
                                <span className="verifiedVendorBadge verifiedVendorBadge--sm">
                                  <i className="fa-solid fa-circle-check" aria-hidden="true" />
                                  Verified
                                </span>
                              )}
                            </h5>
                            {product.vendorWebsite && (
                              <div className="mb-1">
                                <a href={product.vendorWebsite.startsWith('http') ? product.vendorWebsite : `https://${product.vendorWebsite}`} target="_blank" rel="noopener noreferrer" className="text-decoration-none text-secondary small">
                                  <i className="fa-solid fa-globe me-2 text-primary" />
                                  {product.vendorWebsite.replace(/^https?:\/\//, '')}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
                        {canLinkStorefront && (
                          <Link href={`/vendor/${vendorProfileId}`} className={`btn rounded-pill px-4 ${showCompanyProfile ? 'btn-primary' : 'btn-outline-primary'}`}>
                            {showCompanyProfile ? 'Company profile' : 'View store'}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vendor Information Section (standard buy flow) */}
          {hasVendorProfile && !canRfq && (
            <div className="vendor-section glass-card mb-5" style={{ paddingTop: '20px' }}>
              <div className="p-4 border-bottom">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className='font-bold mb-0'>
                    Sold By
                  </h4>
                  {showCompanyProfile && canLinkStorefront && (
                    <Link href={`/vendor/${vendorProfileId}`} className="btn btn-sm btn-outline-primary rounded-pill px-3">
                      View Full Profile
                    </Link>
                  )}
                </div>
                
                <div className="vendor-info-card bg-light p-4 rounded">
                  <div className="row align-items-center g-3">
                    <div className="col-lg-8">
                      <div className="d-flex align-items-start gap-3">
                        <VendorLogoAvatar logo={vendorLogo} />
                        <div className="flex-grow-1">
                          <h5 className="font-bold mb-2 d-flex flex-wrap align-items-center gap-2">
                            {product.vendorName || 'Vendor'}
                            {verifiedVendorBadge && (
                              <span className="verifiedVendorBadge verifiedVendorBadge--sm">
                                <i className="fa-solid fa-circle-check" aria-hidden="true" />
                                Verified
                              </span>
                            )}
                          </h5>
                          {product.vendorWebsite && (
                            <div className="mb-1">
                              <a href={product.vendorWebsite.startsWith('http') ? product.vendorWebsite : `https://${product.vendorWebsite}`} target="_blank" rel="noopener noreferrer" className="text-decoration-none text-secondary small">
                                <i className="fa-solid fa-globe me-2 text-primary" />
                                {product.vendorWebsite.replace(/^https?:\/\//, '')}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
                      {canLinkStorefront && (
                        <div className="d-flex flex-column flex-sm-row gap-2 justify-content-lg-end">
                          <Link href={`/vendor/${vendorProfileId}`} className="btn btn-primary rounded-pill px-4">
                            {showCompanyProfile ? 'Contact Seller' : 'View store'}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional Info */}
              {canLinkStorefront && (
              <div className="px-4 py-3 bg-light">
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="d-flex align-items-center gap-2">
                      <i className="fa-solid fa-shield-halved text-success"></i>
                      <small className="text-muted">{verifiedVendorBadge ? 'Verified Seller' : 'Trusted Seller'}</small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="d-flex align-items-center gap-2">
                      <i className="fa-solid fa-truck text-primary"></i>
                      <small className="text-muted">Fast Shipping</small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="d-flex align-items-center gap-2">
                      <i className="fa-solid fa-rotate-left text-info"></i>
                      <small className="text-muted">Easy Returns</small>
                    </div>
                  </div>
                </div>
              </div>
              )}
            </div>
          )}

          <div className="related-products-section mt-5 pt-4">
            <h4 className='font-bold mb-4 text-center'>Related Products</h4>
            <Swiper
              autoplay={{ delay: 4000 }}
              modules={[Autoplay]}
              spaceBetween={20}
              breakpoints={{
                0: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                992: { slidesPerView: 4 },
                1200: { slidesPerView: 5 },
              }}
            >
              {similar.map((obj, key) => (
                <SwiperSlide key={key}>
                  <div className="ProductCard glass-card p-2 text-center h-100 d-flex flex-column">
                    <div className='position-relative overflow-hidden rounded mb-2' style={{ height: '180px' }}>
                      <Link href={'/p/' + obj.slug + '/' + obj._id}>
                        <img 
                          src={ServerId + '/product/' + obj.uni_id_1 + obj.uni_id_2 + '/' + obj.files[0].filename} 
                          alt={obj.name} 
                          className="img-fluid h-100 w-100 object-fit-contain"
                        />
                      </Link>
                      <div className="Badge position-absolute top-0 start-0 bg-danger text-white small px-2">-{obj.discount}%</div>
                    </div>
                    <div className="p-2 flex-grow-1">
                      <CategoryPath category={obj.category} variant="card" className="mb-1" />
                      <h6 className='font-bold small mb-1 text-dark truncate-2'>{obj.name}</h6>
                      <div className='small'>
                        {obj.allowRfq === true ? (
                          <span className='font-bold text-primary'>RFQ</span>
                        ) : (
                          <>
                            <span className='text-muted text-decoration-line-through me-2'>₹{obj.mrp}</span>
                            <span className='font-bold text-primary'>₹{obj.price}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      className='btn btn-sm btn-primary w-100 mt-2 rounded-pill'
                      onClick={() => {
                        if (obj.allowRfq === true) {
                          navigate.push('/p/' + obj.slug + '/' + obj._id);
                          return;
                        }
                        userAxios((server) => {
                          server.post('/users/addToWishlist', {
                            userId: userLogged._id,
                            item: { proId: obj._id, price: obj.price, mrp: obj.mrp, variantSize: obj.currVariantSize || '' }
                          }).then(() => {
                            toast.success("Added to wishlist");
                          }).catch(() => {
                            setLoginModal({ btn: true, active: true, member: true });
                          });
                        });
                      }}
                    >
                      {obj.allowRfq === true ? 'Full Details' : 'Add to Wishlist'}
                    </button>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductComp
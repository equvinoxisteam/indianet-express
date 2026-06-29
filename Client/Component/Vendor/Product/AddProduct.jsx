import { useContext } from 'react'
import JoditEditor from 'jodit-react';
import { useRef, Fragment, useEffect, useState, useCallback } from 'react';
import Server, { vendorAxios } from '../../../Config/Server';
import ContentControl from '../../../ContentControl/ContentControl'
import { useRouter } from 'next/router';
import { COMMISSION_PERCENT, FIXED_FEE_PER_LINE, SETTLEMENT_DAYS, computeLinePlatformFee } from '@/Config/platformFees'
import ObjectId from 'bson-objectid';
import PickupAddressSelect from './PickupAddressSelect'

const MAX_PRODUCT_IMAGES = 4
const MAX_GALLERY_IMAGES = MAX_PRODUCT_IMAGES - 1

function AddProduct() {
  const editor = useRef(null)

  const router = useRouter()
  const navigate = router

  const { setVendorLogged } = useContext(ContentControl)

  const [categories, setCategories] = useState([])
  const [submitMode, setSubmitMode] = useState('publish')
  const [planAccess, setPlanAccess] = useState(null)

  const [productDetails, setProductDetails] = useState(
    {
      name: '',
      price: 0,
      mrp: 0,
      available: 'true',
      cancellation: 'false',
      return: 'false',
      category: '',
      categorySlug: '',
      srtDescription: '',
      description: '',
      seoDescription: '',
      seoTitle: '',
      seoKeyword: '',
      variant: [],
      allowCod: true,
      allowOnline: true,
      allowRfq: false,
      publishStatus: 'draft',
      rfqTiers: [{ minQty: '1', maxQty: '', price: '' }],
      rfqAttributes: [{ key: '', value: '' }],
      rfqCustomization: false,
      rfqCustomizationDesc: '',
      rfqHandlingTime: '',
      rfqLeadTime: '',
      rfqPackaging: {},
      rfqCertificates: [],
      isShowcase: false,
      pickupAddressId: '',
      weightKg: 2.5,
      lengthCm: 10,
      breadthCm: 15,
      heightCm: 20,
      uni_id_1: Date.now() + Math.random(),
    }
  )

  const [thumbPrev, setThumbPrev] = useState()
  const [thumb, setThumb] = useState()
  /** { id, file, url }[] — gallery after thumbnail, max MAX_GALLERY_IMAGES */
  const [galleryItems, setGalleryItems] = useState([])

  const revokeGalleryUrls = useCallback((items) => {
    (items || []).forEach((g) => {
      if (g?.url) try { URL.revokeObjectURL(g.url) } catch (_) { /* noop */ }
    })
  }, [])

  const galleryRef = useRef([])
  galleryRef.current = galleryItems
  useEffect(() => () => revokeGalleryUrls(galleryRef.current), [revokeGalleryUrls])

  const addGalleryFiles = (fileList) => {
    const picked = Array.from(fileList || [])
    setGalleryItems((prev) => {
      const room = MAX_GALLERY_IMAGES - prev.length
      if (room <= 0) {
        alert(`Maximum ${MAX_PRODUCT_IMAGES} images total (${MAX_GALLERY_IMAGES} after thumbnail).`)
        return prev
      }
      const toAdd = picked.slice(0, room).map((file, i) => ({
        id: `${Date.now()}-${i}-${file.name}`,
        file,
        url: URL.createObjectURL(file)
      }))
      if (picked.length > room) {
        alert(`Only ${room} more image(s) allowed (${MAX_PRODUCT_IMAGES} total with thumbnail).`)
      }
      return [...prev, ...toAdd]
    })
  }

  const removeGalleryItem = (id) => {
    setGalleryItems((prev) => {
      const t = prev.find((x) => x.id === id)
      if (t?.url) URL.revokeObjectURL(t.url)
      return prev.filter((x) => x.id !== id)
    })
  }

  useEffect(() => {
    vendorAxios((server) => {
      server.get('/vendor/getPlanAccess').then((res) => {
        if (!res.data.login) setPlanAccess(res.data)
      }).catch(() => {})
    })
  }, [])

  useEffect(() => {
    Server.get('/vendor/getCategories').then((data) => {
      setCategories(data.data)

      if (data.data !== undefined && data.data !== null && data.data.length !== 0) {
        setProductDetails(productDetails => ({
          ...productDetails,
          category: data.data[0].name,
          categorySlug: data.data[0].slug
        }))
      }
    }).catch((err) => {
      console.log('categories err')
    })
  }, [])

  useEffect(() => {
    if (!router.query.copyFrom) return
    vendorAxios((server) => {
      server.get(`/vendor/getOneProduct/${router.query.copyFrom}`).then((res) => {
        if (!res.data || res.data.login) return
        const src = res.data
        setProductDetails((old) => ({
          ...old,
          name: `${src.name || ''} (Copy)`,
          available: src.available || 'true',
          category: src.category || old.category,
          categorySlug: src.categorySlug || old.categorySlug,
          srtDescription: src.srtDescription || '',
          description: src.description || '',
          seoDescription: src.seoDescription || '',
          seoTitle: src.seoTitle || '',
          seoKeyword: src.seoKeyword || '',
          variant: Array.isArray(src.variant) ? src.variant.map((v) => ({ ...v, id: new ObjectId().toHexString() })) : [],
          publishStatus: src.publishStatus || 'draft',
          rfqTiers: Array.isArray(src.rfqTiers) && src.rfqTiers.length ? src.rfqTiers : old.rfqTiers,
          rfqAttributes: Array.isArray(src.rfqAttributes) && src.rfqAttributes.length ? src.rfqAttributes : old.rfqAttributes,
          rfqCustomization: src.rfqCustomization === true,
          rfqCustomizationDesc: src.rfqCustomizationDesc || '',
          rfqHandlingTime: src.rfqHandlingTime || '',
          rfqLeadTime: src.rfqLeadTime || '',
          rfqCertificates: Array.isArray(src.rfqCertificates) ? src.rfqCertificates : []
        }))
      }).catch(() => {})
    })
  }, [router.query.copyFrom])

  function FormSubmit(e) {
    e.preventDefault();
    const finalStatus = submitMode === 'draft' ? 'draft' : (productDetails.publishStatus || 'published')

    const galleryCount = galleryItems.length
    if (finalStatus !== 'draft' && !thumb) {
      alert('Please add a thumbnail image.')
      return
    }
    if (finalStatus !== 'draft' && 1 + galleryCount > MAX_PRODUCT_IMAGES) {
      alert(`Maximum ${MAX_PRODUCT_IMAGES} product images (1 thumbnail + up to ${MAX_GALLERY_IMAGES} more).`)
      return
    }

    if (finalStatus !== 'draft' && !productDetails.pickupAddressId) {
      alert('Select a pickup address for this product (or save as draft).')
      return
    }

    const firstVariant = productDetails.variant[0]
    const listPrice = firstVariant ? Number(firstVariant.price) || 0 : Number(productDetails.price) || 0
    const listMrp = firstVariant ? Number(firstVariant.mrp) || 0 : Number(productDetails.mrp) || 0

    let formData = new FormData();

    formData.append("uni_id_1", productDetails.uni_id_1)
    formData.append("uni_id_2", Date.now() + Math.random())
    formData.append("name", productDetails.name)
    formData.append("price", listPrice)
    formData.append("mrp", listMrp)
    formData.append("available", productDetails.available)
    formData.append("cancellation", false)
    formData.append("category", productDetails.category)
    formData.append("variant", JSON.stringify(productDetails.variant))
    formData.append("categorySlug", productDetails.categorySlug)
    formData.append("srtDescription", productDetails.srtDescription)
    formData.append("description", productDetails.description)
    formData.append("seoDescription", productDetails.seoDescription)
    formData.append("seoKeyword", productDetails.seoKeyword)
    formData.append("seoTitle", productDetails.seoTitle)
    formData.append('return', productDetails.return || 'false')
    formData.append('allowCod', String(productDetails.allowCod !== false))
    formData.append('allowOnline', String(productDetails.allowOnline !== false))
    formData.append('allowRfq', 'false')
    formData.append('publishStatus', finalStatus)
    formData.append('rfqTiers', JSON.stringify(productDetails.rfqTiers))
    formData.append('rfqAttributes', JSON.stringify(productDetails.rfqAttributes))
    formData.append('rfqCustomization', productDetails.rfqCustomization)
    formData.append('rfqCustomizationDesc', productDetails.rfqCustomizationDesc)
    formData.append('rfqHandlingTime', productDetails.rfqHandlingTime || '')
    formData.append('rfqLeadTime', productDetails.rfqLeadTime)
    formData.append('rfqPackaging', JSON.stringify({}))
    formData.append('rfqCertificates', JSON.stringify(productDetails.rfqCertificates || []))
    formData.append('isShowcase', productDetails.isShowcase ? 'true' : 'false')
    formData.append('pickupAddressId', productDetails.pickupAddressId || '')
    formData.append('weightKg', productDetails.weightKg ?? 2.5)
    formData.append('lengthCm', productDetails.lengthCm ?? 10)
    formData.append('breadthCm', productDetails.breadthCm ?? 15)
    formData.append('heightCm', productDetails.heightCm ?? 20)

    if (thumb) {
      formData.append('images', thumb);
      galleryItems.forEach((g) => {
        formData.append('images', g.file)
      })
    }
    
    // Append variant images
    productDetails.variant.forEach((v, index) => {
        if (v.variantFiles && v.variantFiles.length > 0) {
            for (let i = 0; i < v.variantFiles.length; i++) {
                formData.append(`variantImage_${index}`, v.variantFiles[i]);
            }
        }
    })

    vendorAxios((server) => {
      server.post('/vendor/addProduct', formData, {
        headers: {
          "Content-type": "multipart/form-data",
        },
      }).then((res) => {
        if (res.data.login) {
          setVendorLogged({ status: false })
          localStorage.removeItem('vendorToken')
          navigate.push('/vendor/login')
        } else {
          navigate.push('/vendor/products')
        }
      }).catch((err) => {
        const msg = err.response?.data?.error
        alert(msg || 'Sorry, the server had a problem saving this product.')
      })
    })
  }

  return (
    <div className='AddProduct containerVendor'>
      <div className="vendorPageHeader">
        <h1 className="vendorPageTitle">Add product</h1>
        <p className="vendorPageSubtitle">RFQ-only listing wizard for fast vendor onboarding</p>
      </div>

      {planAccess && !planAccess.isActive && (
        <div className="alert alert-warning mb-3">
          {planAccess.isPending
            ? 'Plan activation pending. You can save drafts; publishing requires an active plan.'
            : 'No active plan. Request a plan from Plans — admin activates after external payment.'}
        </div>
      )}
      {planAccess?.isActive && (
        <div className="alert alert-info py-2 mb-3">
          Plan: <strong>{planAccess.planLabel}</strong>
          {planAccess.showcaseUnlimited ? (
            <span> — Showcases: {planAccess.showcaseUsed || 0} / Unlimited</span>
          ) : planAccess.showcaseLimit > 0 && (
            <span> — Showcases: {planAccess.showcaseUsed || 0}/{planAccess.showcaseLimit}</span>
          )}
        </div>
      )}

      <form onSubmit={FormSubmit} className="productEditorForm settingsProfileCard">

        <div className="row g-3">
          <div className='col-12'>
            <label >Product Name</label><br />
            <input value={productDetails.name} type="text" required onInput={(e) => {
              setProductDetails({ ...productDetails, name: e.target.value })
            }} />
          </div>


          <div className='col-md-6'>
            <label>Available</label><br />
            <select value={productDetails.available} onInput={(e) => {
              setProductDetails({ ...productDetails, available: e.target.value })
            }} >
              <option value="true">Available</option>
              <option value="false">Not Available</option>
            </select>
          </div>
          <div className='col-md-6'>
            <label>Status</label><br />
            <select value={productDetails.publishStatus || 'draft'} onInput={(e) => {
              setProductDetails({ ...productDetails, publishStatus: e.target.value })
            }}>
              <option value="draft">Draft</option>
              <option value="published">Publish</option>
              <option value="archived">Archive</option>
            </select>
          </div>

          {planAccess?.isActive && (
            <div className='col-md-12'>
              <div className="vendorShowcaseOption">
                <label
                  className={`vendorShowcaseOption__label${
                    productDetails.publishStatus !== 'published' ||
                    (planAccess.showcaseLocked && !planAccess.canChangeShowcase) ||
                    (!planAccess.showcaseUnlimited && !productDetails.isShowcase && (planAccess.showcaseUsed ?? 0) >= (planAccess.showcaseLimit ?? 0))
                      ? ' vendorShowcaseOption__label--disabled' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    className="vendorShowcaseOption__input"
                    checked={productDetails.isShowcase}
                    onChange={(e) => {
                      const checked = e.target.checked
                      if (checked && !planAccess.showcaseUnlimited) {
                        const used = planAccess.showcaseUsed ?? 0
                        const limit = planAccess.showcaseLimit ?? 0
                        if (used + 1 >= limit) {
                          const ok = window.confirm(
                            `This uses your last showcase slot (${limit} on ${planAccess.planLabel}). ` +
                            'You cannot change showcased products later unless you upgrade to Pro or Premium. Continue?'
                          )
                          if (!ok) return
                        }
                      }
                      setProductDetails({ ...productDetails, isShowcase: checked })
                    }}
                    disabled={
                      productDetails.publishStatus !== 'published' ||
                      (planAccess.showcaseLocked && !planAccess.canChangeShowcase) ||
                      (!planAccess.showcaseUnlimited && !productDetails.isShowcase && (planAccess.showcaseUsed ?? 0) >= (planAccess.showcaseLimit ?? 0))
                    }
                  />
                  <span className="vendorShowcaseOption__box" aria-hidden="true" />
                  <span className="vendorShowcaseOption__text">
                    Mark as product showcase ({planAccess.showcaseUnlimited
                      ? `${planAccess.showcaseUsed ?? 0} / Unlimited`
                      : `${planAccess.showcaseUsed ?? 0}/${planAccess.showcaseLimit ?? 0} used`})
                  </span>
                </label>
                {productDetails.publishStatus !== 'published' && (
                  <p className="vendorShowcaseOption__hint">Publish the product first to enable showcase.</p>
                )}
                {planAccess.showcaseLocked && !planAccess.canChangeShowcase && (
                  <p className="vendorShowcaseOption__hint">Showcase selection is locked. Upgrade to Pro to change showcased products.</p>
                )}
              </div>
            </div>
          )}

          <div className="col-md-12">
            <label className="fw-semibold">Sales mode</label>
            <div className="d-flex flex-wrap gap-3 mb-2">
              <label className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  name="salesMode"
                  checked={!productDetails.allowRfq}
                  onChange={() => setProductDetails({ ...productDetails, allowRfq: false, allowCod: true, allowOnline: true })}
                />
                <span className="form-check-label">E-commerce (sell online with price)</span>
              </label>
              <label className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  name="salesMode"
                  checked={!!productDetails.allowRfq}
                  onChange={() => setProductDetails({ ...productDetails, allowRfq: true, allowCod: false, allowOnline: false })}
                />
                <span className="form-check-label">RFQ only (quote on request)</span>
              </label>
            </div>
            {!productDetails.allowRfq && (
              <div className="col-md-12">
                <div className="alert alert-info mb-3" style={{ borderRadius: '12px' }}>
                  <strong>Platform pricing (Indianet Express)</strong>
                  <p className="mb-2 small text-muted">
                    You set your product price. Customer pays your price + {COMMISSION_PERCENT}% platform fee + ₹{FIXED_FEE_PER_LINE} per item + GST (18%) + Shiprocket shipping.
                    You receive your full listed price — settled to you every {SETTLEMENT_DAYS} days after order.
                  </p>
                  {(() => {
                    const listPrice = Number(productDetails.variant?.[0]?.price || productDetails.price) || 0
                    if (listPrice <= 0) return null
                    const fee = computeLinePlatformFee(listPrice)
                    return (
                      <ul className="mb-0 small" style={{ lineHeight: 1.8 }}>
                        <li>Your price (you receive): <strong>₹{listPrice.toLocaleString('en-IN')}</strong></li>
                        <li>Platform fee ({COMMISSION_PERCENT}% + ₹{FIXED_FEE_PER_LINE}): <strong>₹{fee.platformFeeTotal.toLocaleString('en-IN')}</strong></li>
                        <li>Customer pays (excl. GST &amp; shipping): <strong>₹{fee.customerProductPlusFee.toLocaleString('en-IN')}</strong></li>
                      </ul>
                    )
                  })()}
                </div>
              </div>
            )}
            {!productDetails.allowRfq && (
              <div className="d-flex flex-wrap gap-4 mb-3">
                <label className="form-check">
                  <input type="checkbox" className="form-check-input" checked={!!productDetails.allowOnline} onChange={(e) => setProductDetails({ ...productDetails, allowOnline: e.target.checked })} />
                  <span className="form-check-label">Accept online payment (Razorpay)</span>
                </label>
                <label className="form-check">
                  <input type="checkbox" className="form-check-input" checked={!!productDetails.allowCod} onChange={(e) => setProductDetails({ ...productDetails, allowCod: e.target.checked })} />
                  <span className="form-check-label">Accept cash on delivery</span>
                </label>
              </div>
            )}
          </div>

          {!productDetails.allowRfq && (
            <div className="col-md-12 editorSection">
              <h5 className="editorSectionTitle">Pickup &amp; shipping</h5>
              <p className="editorSectionHint small text-muted">Shiprocket uses this address to estimate shipping and create pickup. Manage addresses in Settings.</p>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="fw-semibold">Pickup address</label>
                  <PickupAddressSelect
                    value={productDetails.pickupAddressId}
                    onChange={(id) => setProductDetails({ ...productDetails, pickupAddressId: id })}
                    required={submitMode !== 'draft'}
                  />
                </div>
                <div className="col-md-6">
                  <label className="fw-semibold">Package weight (kg)</label>
                  <input type="number" min="0.1" step="0.1" className="form-control" value={productDetails.weightKg}
                    onChange={(e) => setProductDetails({ ...productDetails, weightKg: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label>Length (cm)</label>
                  <input type="number" min="1" className="form-control" value={productDetails.lengthCm}
                    onChange={(e) => setProductDetails({ ...productDetails, lengthCm: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label>Breadth (cm)</label>
                  <input type="number" min="1" className="form-control" value={productDetails.breadthCm}
                    onChange={(e) => setProductDetails({ ...productDetails, breadthCm: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label>Height (cm)</label>
                  <input type="number" min="1" className="form-control" value={productDetails.heightCm}
                    onChange={(e) => setProductDetails({ ...productDetails, heightCm: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {productDetails.allowRfq && (
            <>
            <div className="col-md-12">
              <label>Step 1: Pricing blocks (shown in client RFQ pricing)</label><br />
              {productDetails['rfqTiers'].map((obj, key) => (
                <div key={key} className='variantBox'>
                  <div className='row'>
                    <div className="col-md-3">
                      <label>Minimum quantity</label>
                      <input type="number" value={obj.minQty} onChange={(e) => {
                        var newArr = [...productDetails['rfqTiers']]
                        newArr[key].minQty = e.target.value
                        setProductDetails({ ...productDetails, rfqTiers: newArr })
                      }} required />
                    </div>
                    <div className="col-md-3">
                      <label>Maximum quantity (optional)</label>
                      <input type="number" value={obj.maxQty} onChange={(e) => {
                        var newArr = [...productDetails['rfqTiers']]
                        newArr[key].maxQty = e.target.value
                        setProductDetails({ ...productDetails, rfqTiers: newArr })
                      }} />
                    </div>
                    <div className="col-md-3">
                      <label>Quote price</label>
                      <input type="number" value={obj.price} onChange={(e) => {
                        var newArr = [...productDetails['rfqTiers']]
                        newArr[key].price = e.target.value
                        setProductDetails({ ...productDetails, rfqTiers: newArr })
                      }} required />
                    </div>
                    <div className="col-md-3">
                      <label>Action</label><br />
                      <button type='button' onClick={() => {
                        setProductDetails({
                          ...productDetails,
                          rfqTiers: productDetails['rfqTiers'].filter((_, index) => index !== key)
                        })
                      }}>X</button>
                    </div>
                  </div>
                </div>
              ))}
              <button className="editorAddBtn" data-for="variantAdd" type='button' onClick={() => {
                setProductDetails({
                  ...productDetails,
                  rfqTiers: [...productDetails.rfqTiers, {
                    minQty: '',
                    maxQty: '',
                    price: ''
                  }]
                })
              }}>Add pricing block</button>
            </div>
            
            <div className="col-md-12 mt-3">
              <label>Step 2: Specifications (shown in "Specifications" tab)</label><br />
              {productDetails['rfqAttributes'].map((obj, key) => (
                <div key={key} className='variantBox mb-2 p-2'>
                  <div className='row'>
                    <div className="col-md-5">
                        <label>Specification name (e.g. Type, Material)</label>
                        <input type="text" value={obj.key} onChange={(e) => {
                        var newArr = [...productDetails['rfqAttributes']]
                        newArr[key].key = e.target.value
                        setProductDetails({ ...productDetails, rfqAttributes: newArr })
                        }} required />
                    </div>
                    <div className="col-md-5">
                        <label>Specification value</label>
                        <input type="text" value={obj.value} onChange={(e) => {
                        var newArr = [...productDetails['rfqAttributes']]
                        newArr[key].value = e.target.value
                        setProductDetails({ ...productDetails, rfqAttributes: newArr })
                        }} required />
                    </div>
                    <div className="col-md-2">
                        <label>Action</label><br />
                        <button type='button' className="btn-sm" onClick={() => {
                        setProductDetails({
                            ...productDetails,
                            rfqAttributes: productDetails['rfqAttributes'].filter((_, index) => index !== key)
                        })
                        }}>X</button>
                    </div>
                   </div>
                </div>
              ))}
              {productDetails['rfqAttributes'].length < 10 && (
                <button className="editorAddBtn" data-for="variantAdd" type='button' onClick={() => {
                    setProductDetails({
                    ...productDetails,
                    rfqAttributes: [...productDetails.rfqAttributes, { key: '', value: '' }]
                    })
                }}>Add specification</button>
              )}
            </div>

            <div className="col-md-12 mt-3">
                <label>Step 3: Customization available?</label><br/>
                <select value={productDetails.rfqCustomization} onChange={(e) => {
                    setProductDetails({ ...productDetails, rfqCustomization: e.target.value === 'true' })
                }}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>
                {productDetails.rfqCustomization && (
                    <div className="mt-2">
                        <label>Customization Details / Description</label><br/>
                        <textarea rows="3" style={{width: '100%'}} value={productDetails.rfqCustomizationDesc} onChange={(e) => {
                             setProductDetails({ ...productDetails, rfqCustomizationDesc: e.target.value })
                        }} placeholder="E.g., Logo/graphic design(+ from +₹4.74/piece/Min. order: 500 pieces)"></textarea>
                    </div>
                )}
            </div>

            <div className="col-md-12 mt-3 mb-4">
                <label>Step 4: Handling time</label><br/>
                <textarea rows="2" style={{width: '100%'}} value={productDetails.rfqHandlingTime} onChange={(e) => {
                    setProductDetails({ ...productDetails, rfqHandlingTime: e.target.value })
                }} placeholder="E.g., Ships in 5 business days"></textarea>
            </div>

            <div className="col-md-12 mt-2 mb-4">
                <label>Step 4: Lead time</label><br/>
                <textarea rows="3" style={{width: '100%'}} value={productDetails.rfqLeadTime} onChange={(e) => {
                    setProductDetails({ ...productDetails, rfqLeadTime: e.target.value })
                }} placeholder="E.g., Quantity (pieces) 1 - 50,000 : 31 days | > 50,000 : To be negotiated"></textarea>
            </div>

            <div className="col-md-12 mt-3">
              <label>Step 5: Certificates / compliance labels (optional)</label><br />
              {(productDetails.rfqCertificates || []).map((obj, key) => (
                <div key={key} className="variantBox mb-2 p-2">
                  <div className="row">
                    <div className="col-md-5">
                      <label>Name</label>
                      <input type="text" value={obj.name || ''} onChange={(e) => {
                        const arr = [...(productDetails.rfqCertificates || [])]
                        arr[key] = { ...arr[key], name: e.target.value }
                        setProductDetails({ ...productDetails, rfqCertificates: arr })
                      }} placeholder="e.g. CP65" />
                    </div>
                    <div className="col-md-5">
                      <label>Description (optional)</label>
                      <input type="text" value={obj.description || ''} onChange={(e) => {
                        const arr = [...(productDetails.rfqCertificates || [])]
                        arr[key] = { ...arr[key], description: e.target.value }
                        setProductDetails({ ...productDetails, rfqCertificates: arr })
                      }} />
                    </div>
                    <div className="col-md-2">
                      <label> </label><br />
                      <button type="button" className="editorRemoveBtn" onClick={() => {
                        setProductDetails({
                          ...productDetails,
                          rfqCertificates: (productDetails.rfqCertificates || []).filter((_, i) => i !== key)
                        })
                      }}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" className="editorAddBtn" data-for="variantAdd" onClick={() => {
                setProductDetails({
                  ...productDetails,
                  rfqCertificates: [...(productDetails.rfqCertificates || []), { name: '', description: '' }]
                })
              }}>Add certificate</button>
            </div>
            </>
          )}
          <div className="col-md-12">
            <label>Step 6: Variants</label><br />
            {
              productDetails['variant'].map((obj, key) => {
                return (
                  <div key={key} className='variantBox' >
                    <div className='row' >
                      <div className="col-md-3">
                        <label>Size</label>
                        <select value={obj.size === 'Other' ? 'Other' : obj.size} onChange={(e) => {
                          var newArr = [...productDetails['variant']]
                          newArr[key].size = e.target.value
                          if (e.target.value !== 'Other') {
                              newArr[key].customSize = '';
                          }
                          setProductDetails({
                            ...productDetails,
                            variant: newArr
                          })
                        }} required >
                          <option>S</option>
                          <option>M</option>
                          <option>L</option>
                          <option>XL</option>
                          <option>Other</option>
                        </select>
                        {obj.size === 'Other' && (
                            <input type={"text"} className="mt-2" placeholder="Custom Variant / Size" value={obj.customSize || ''} onChange={(e) => {
                                var newArr = [...productDetails['variant']]
                                newArr[key].customSize = e.target.value
                                setProductDetails({ ...productDetails, variant: newArr })
                            }} required />
                        )}
                      </div>
                      <div className="col-md-6">
                        <div className="row">
                          <div className="col-9 col-md-3">
                            <label>Selling price (₹)</label>
                            <input type="number" min="0" value={obj.price} onChange={(e) => {
                              var newArr = [...productDetails['variant']]
                              newArr[key].price = e.target.value
                              setProductDetails({ ...productDetails, variant: newArr })
                            }} required={!productDetails.allowRfq} />
                          </div>
                          <div className="col-9 col-md-3">
                            <label>MRP (₹)</label>
                            <input type="number" min="0" value={obj.mrp} onChange={(e) => {
                              var newArr = [...productDetails['variant']]
                              newArr[key].mrp = e.target.value
                              setProductDetails({ ...productDetails, variant: newArr })
                            }} />
                          </div>
                          <div className="col-9 col-md-3">
                            <label>Details</label>
                            <input type="text" value={obj.details} onChange={(e) => {
                              var newArr = [...productDetails['variant']]
                              newArr[key].details = e.target.value
                              setProductDetails({
                                ...productDetails,
                                variant: newArr
                              })
                            }} required />
                          </div>
                          <div className="col-3 col-md-4">
                            <label>Action</label><br />
                            <button type='button' onClick={() => {
                              setProductDetails({
                                ...productDetails,
                                variant: productDetails['variant'].filter((old) => {
                                  return old.id !== obj.id
                                })
                              })
                            }} >X</button>
                          </div>
                        </div>
                        <div className="row mt-2">
                          <div className="col-12">
                             <label>Variant Images (Max 3)</label><br />
                             <input className="editorFileInput" type="file" multiple accept="image/*" onChange={(e) => {
                                 if (e.target.files.length > 3) {
                                     alert('Maximum 3 images allowed per variant');
                                     e.target.value = null;
                                 } else {
                                     var newArr = [...productDetails['variant']]
                                     newArr[key].variantFiles = Array.from(e.target.files)
                                     setProductDetails({ ...productDetails, variant: newArr })
                                 }
                             }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            }
            <button className="editorAddBtn" data-for="variantAdd" type='button' onClick={() => {
              setProductDetails({
                ...productDetails,
                variant: [...productDetails.variant, {
                  size: 'S',
                  price: 0,
                  mrp: 0,
                  details: '',
                  id: new ObjectId().toHexString()
                }]
              })
            }} >Add Variant</button>
          </div>

          <div className='col-md-12'>
            <label>Category</label><br />
            <select onInput={(e) => {
              var category = JSON.parse(e.target.value)

              setProductDetails({
                ...productDetails,
                category: category.name,
                categorySlug: category.slug
              })

            }} required >

              {
                categories.map((obj, key) => {
                  var mainSub = obj.mainSub
                  var sub = obj.sub
                  return (
                    <Fragment key={key}>
                      <option value={JSON.stringify(obj)}>{obj.name}</option>
                      {
                        mainSub.map((obj2, key2) => {
                          return (
                            <option key={key2} value={JSON.stringify({
                              name: `${obj.name} > ${obj2.name}`,
                              slug: obj2.slug
                            })
                            }> {obj.name}{' > '}{obj2.name}</option>
                          )
                        })
                      }

                      {
                        sub.map((obj3, key3) => {
                          return (
                            <option key={key3} value={JSON.stringify({
                              name: `${obj.name} > ${obj3.mainSub} > ${obj3.name}`,
                              slug: obj3.slug
                            })}>{obj.name}{' > '}{obj3.mainSub}{' > '}{obj3.name}</option>
                          )
                        })
                      }
                    </Fragment>
                  )
                })
              }

            </select>
          </div>

          <div className="col-12">
            <label className="fw-bold">Thumbnail (required)</label>
            <span className="vendorDimHint">Recommended: square or 4:3, at least 800×800 px, JPG/PNG/WebP, under 2 MB.</span>
            {thumbPrev && (
              <div className="vendorPreviewGrid" style={{ maxWidth: '200px', marginTop: '10px' }}>
                <div className="vendorPreviewTile">
                  <img src={thumbPrev} alt="" />
                  <span className="vendorPreviewLabel">Main</span>
                </div>
              </div>
            )}
            <input
              accept="image/*"
              type="file"
              className="form-control mt-2 editorFileInput"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) {
                  setThumb(f)
                  setThumbPrev(URL.createObjectURL(f))
                }
                e.target.value = ''
              }}
            />
          </div>

          <div className="col-12 mt-3">
            <label className="fw-bold">More product photos (optional)</label>
            <span className="vendorDimHint">
              Add one or many at once — up to {MAX_GALLERY_IMAGES} extra ({MAX_PRODUCT_IMAGES} total with thumbnail). Same size tips as thumbnail.
            </span>
            <div className="vendorPreviewGrid">
              {galleryItems.map((g) => (
                <div key={g.id} className="vendorPreviewTile">
                  <img src={g.url} alt="" />
                  <button type="button" className="vendorPreviewRemove" onClick={() => removeGalleryItem(g.id)} aria-label="Remove">
                    <i className="fa-solid fa-xmark" />
                  </button>
                  <span className="vendorPreviewLabel">Gallery</span>
                </div>
              ))}
            </div>
            <label className="vendorDropZone d-block mt-2 mb-0">
              <input
                accept="image/*"
                type="file"
                multiple
                className="d-none"
                disabled={galleryItems.length >= MAX_GALLERY_IMAGES}
                onChange={(e) => {
                  addGalleryFiles(e.target.files)
                  e.target.value = ''
                }}
              />
              <p className="vendorDropZoneTitle"><i className="fa-solid fa-cloud-arrow-up me-2" />Add images</p>
              <p className="vendorDropZoneHint">Click to choose files — you can select multiple</p>
            </label>
          </div>

          <div className='col-12'>
            <label>SEO Title</label><br />
            <input value={productDetails.seoTitle} type="text" onInput={(e) => {
              setProductDetails({
                ...productDetails,
                seoTitle: e.target.value
              })
            }} required />
          </div>

          <div className='col-12'>
            <label>SEO Keyword</label><br />
            <input value={productDetails.seoKeyword} type="text" onInput={(e) => {
              setProductDetails({
                ...productDetails,
                seoKeyword: e.target.value
              })
            }} required />
          </div>

          <div className='col-12'>
            <label>SEO Description</label><br />
            <textarea value={productDetails.seoDescription} onInput={(e) => {
              setProductDetails({
                ...productDetails,
                seoDescription: e.target.value
              })
            }} cols="30" rows="10" required></textarea>
          </div>

          <div className='col-12'>
            <label>Short Description</label><br />
            <JoditEditor
              ref={editor}
              value={productDetails.srtDescription}
              tabIndex={1}
              onBlur={newContent => setProductDetails({
                ...productDetails,
                srtDescription: newContent
              })}
              onChange={newContent => { }}
            />
            <br />
          </div>

          <div className='col-12'>
            <label>Description</label><br />
            <JoditEditor
              ref={editor}
              value={productDetails.description}
              tabIndex={1}
              onBlur={newContent => setProductDetails({
                ...productDetails,
                description: newContent
              })}
              onChange={newContent => { }}
            />
          </div>

          <div className='col-12 pt-2'>
            <div className="d-flex gap-2 flex-wrap editorSubmitRow">
              <button type="submit" className='vendorBtnPrimary editorSubmitPrimary' onClick={() => setSubmitMode('publish')}>
                <i className="fa-solid fa-cloud-arrow-up me-2"></i>
                Save & Publish
              </button>
              <button type="submit" formNoValidate className='vendorBtnSecondary editorSubmitSecondary' onClick={() => setSubmitMode('draft')}>
                <i className="fa-regular fa-floppy-disk me-2"></i>
                Save as Draft
              </button>
            </div>
          </div>

        </div>

      </form>
    </div>
  )
}

export default AddProduct
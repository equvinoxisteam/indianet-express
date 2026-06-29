import React, { useRef, Fragment, useContext, useEffect, useState } from 'react'
import JoditEditor from 'jodit-react';
import { vendorAxios } from '../../../Config/Server';
import ContentControl from '../../../ContentControl/ContentControl';
import { useRouter } from 'next/router';
import ObjectId from 'bson-objectid';
import PickupAddressSelect from './PickupAddressSelect'

const MAX_PRODUCT_IMAGES = 4

function EditProduct({
  productDetails, setProductDetails, categories, proId,
  images, setImages,
  serverImg, setServerImg,
  uplodImages, setUploadImg,
  delImages, setDelImg
}) {
  const navigate = useRouter()

  const { setVendorLogged } = useContext(ContentControl)

  const editor = useRef(null);
  const [planAccess, setPlanAccess] = useState(null)

  useEffect(() => {
    vendorAxios((server) => {
      server.get('/vendor/getPlanAccess').then((res) => {
        if (!res.data.login) setPlanAccess(res.data)
      }).catch(() => {})
    })
  }, [])

  const FormSubmit = (e) => {
    e.preventDefault();

    if (!serverImg || serverImg.length > MAX_PRODUCT_IMAGES) {
      alert(`This product can have at most ${MAX_PRODUCT_IMAGES} images.`)
      return
    }

    const firstVariant = productDetails.variant?.[0]
    const listPrice = firstVariant ? Number(firstVariant.price) || Number(productDetails.price) || 0 : Number(productDetails.price) || 0
    const listMrp = firstVariant ? Number(firstVariant.mrp) || Number(productDetails.mrp) || 0 : Number(productDetails.mrp) || 0

    let formData = new FormData();

    formData.append("uni_id_1", productDetails.uni_id_1)
    formData.append("uni_id_2", productDetails.uni_id_2)
    formData.append("_id", productDetails._id)
    formData.append("name", productDetails.name)
    formData.append("price", listPrice)
    formData.append("mrp", listMrp)
    formData.append("variant", JSON.stringify(productDetails.variant))
    formData.append("available", productDetails.available)
    formData.append("publishStatus", productDetails.publishStatus || 'draft')
    formData.append("cancellation", productDetails.cancellation)
    formData.append("category", productDetails.category)
    formData.append("categorySlug", productDetails.categorySlug)
    formData.append("srtDescription", productDetails.srtDescription)
    formData.append("description", productDetails.description)
    formData.append("seoDescription", productDetails.seoDescription)
    formData.append("seoKeyword", productDetails.seoKeyword)
    formData.append("seoTitle", productDetails.seoTitle)
    formData.append("return", productDetails.return)
    formData.append('allowCod', productDetails.allowRfq ? 'false' : String(!!productDetails.allowCod))
    formData.append('allowOnline', productDetails.allowRfq ? 'false' : String(!!productDetails.allowOnline))
    formData.append('allowRfq', String(!!productDetails.allowRfq))
    formData.append('rfqTiers', JSON.stringify(productDetails.rfqTiers || []))
    formData.append('rfqAttributes', JSON.stringify(productDetails.rfqAttributes || []))
    formData.append('rfqCustomization', productDetails.rfqCustomization || false)
    formData.append('rfqCustomizationDesc', productDetails.rfqCustomizationDesc || '')
    formData.append('rfqHandlingTime', productDetails.rfqHandlingTime || '')
    formData.append('rfqLeadTime', productDetails.rfqLeadTime || '')
    formData.append('rfqCertificates', JSON.stringify(productDetails.rfqCertificates || []))
    formData.append('isShowcase', productDetails.isShowcase ? 'true' : 'false')
    formData.append('pickupAddressId', productDetails.pickupAddressId || '')

    // ShipRocket shipment dimension/weight inputs
    formData.append('weightKg', productDetails.weightKg ?? 2.5)
    formData.append('lengthCm', productDetails.lengthCm ?? 10)
    formData.append('breadthCm', productDetails.breadthCm ?? 15)
    formData.append('heightCm', productDetails.heightCm ?? 20)

    formData.append('deleteImg', JSON.stringify(delImages));

    formData.append('serverImg', JSON.stringify(serverImg));


    if (uplodImages.length !== 0) {
      for (var i = 0; i < images.length; i++) {
        formData.append('images', uplodImages[i]);
      }
    }

    // Append variant images
    if (productDetails.variant) {
        productDetails.variant.forEach((v, index) => {
            if (v.variantFiles && v.variantFiles.length > 0) {
                for (let i = 0; i < v.variantFiles.length; i++) {
                    formData.append(`variantImage_${index}`, v.variantFiles[i]);
                }
            }
        })
    }

    vendorAxios((server) => {
      server.put(`/vendor/editProduct/${proId}`, formData, {
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
        alert(msg || 'Sorry, the server had a problem updating this product.')
      })
    })
  }

  return (
    <div className='EditProduct containerVendor'>
      <div className="vendorPageHeader">
        <h1 className="vendorPageTitle">Edit product</h1>
        <p className="vendorPageSubtitle">Update pricing, RFQ options, variants and media in one place</p>
      </div>
      <form onSubmit={FormSubmit} className="productEditorForm settingsProfileCard">

        <div className="row g-3">
          <div className='col-12 editorSection'>
            <h5 className="editorSectionTitle">Step 1: Basic product details</h5>
            <p className="editorSectionHint">Set core status and policies buyers will see on the product page.</p>
          </div>
          <div className='col-12'>
            <label >Product Name</label><br />
            <input value={productDetails.name} type="text" required onInput={(e) => {
              setProductDetails({ ...productDetails, name: e.target.value })
            }} />
          </div>


          <div className='col-12'>
            <label>Cancellation</label><br />
            <select value={productDetails.cancellation} onInput={(e) => {
              setProductDetails({ ...productDetails, cancellation: e.target.value })
            }} >
              <option value="true">Available</option>
              <option value="false">Not Available</option>
            </select>
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

          <div className='col-md-6'>
            <label>Return</label><br />
            <select value={productDetails.return} onInput={(e) => {
              setProductDetails({ ...productDetails, return: e.target.value })
            }} >
              <option value="true">Available</option>
              <option value="false">Not Available</option>
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
                    checked={!!productDetails.isShowcase}
                    onChange={(e) => {
                      const checked = e.target.checked
                      if (checked && !planAccess.showcaseUnlimited) {
                        const used = planAccess.showcaseUsed ?? 0
                        const limit = planAccess.showcaseLimit ?? 0
                        const alreadyShowcase = !!productDetails.isShowcase
                        const newUsed = alreadyShowcase ? used : used + 1
                        if (newUsed >= limit) {
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
                    Product showcase ({planAccess.showcaseUnlimited
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

          <div className="col-md-12 editorSection">
            <h5 className="editorSectionTitle">Sales mode</h5>
            <div className="d-flex flex-wrap gap-3 mb-2">
              <label className="form-check">
                <input type="radio" className="form-check-input" name="salesModeEdit" checked={!productDetails.allowRfq} onChange={() => setProductDetails({ ...productDetails, allowRfq: false, allowCod: true, allowOnline: true })} />
                <span className="form-check-label">E-commerce (sell online)</span>
              </label>
              <label className="form-check">
                <input type="radio" className="form-check-input" name="salesModeEdit" checked={!!productDetails.allowRfq} onChange={() => setProductDetails({ ...productDetails, allowRfq: true, allowCod: false, allowOnline: false })} />
                <span className="form-check-label">RFQ only</span>
              </label>
            </div>
            {!productDetails.allowRfq && (
              <div className="d-flex flex-wrap gap-4 mb-3">
                <label className="form-check">
                  <input type="checkbox" className="form-check-input" checked={!!productDetails.allowOnline} onChange={(e) => setProductDetails({ ...productDetails, allowOnline: e.target.checked })} />
                  <span className="form-check-label">Online payment (Razorpay)</span>
                </label>
                <label className="form-check">
                  <input type="checkbox" className="form-check-input" checked={!!productDetails.allowCod} onChange={(e) => setProductDetails({ ...productDetails, allowCod: e.target.checked })} />
                  <span className="form-check-label">Cash on delivery</span>
                </label>
              </div>
            )}
          </div>

          {!productDetails.allowRfq && (
            <div className="col-md-12 editorSection">
              <h5 className="editorSectionTitle">Pickup &amp; shipping</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="fw-semibold">Pickup address</label>
                  <PickupAddressSelect
                    value={productDetails.pickupAddressId}
                    onChange={(id) => setProductDetails({ ...productDetails, pickupAddressId: id })}
                    required={productDetails.publishStatus === 'published'}
                  />
                </div>
                <div className="col-md-6">
                  <label className="fw-semibold">Package weight (kg)</label>
                  <input type="number" min="0.1" step="0.1" className="form-control" value={productDetails.weightKg ?? 2.5}
                    onChange={(e) => setProductDetails({ ...productDetails, weightKg: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label>Length (cm)</label>
                  <input type="number" min="1" className="form-control" value={productDetails.lengthCm ?? 10}
                    onChange={(e) => setProductDetails({ ...productDetails, lengthCm: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label>Breadth (cm)</label>
                  <input type="number" min="1" className="form-control" value={productDetails.breadthCm ?? 15}
                    onChange={(e) => setProductDetails({ ...productDetails, breadthCm: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label>Height (cm)</label>
                  <input type="number" min="1" className="form-control" value={productDetails.heightCm ?? 20}
                    onChange={(e) => setProductDetails({ ...productDetails, heightCm: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {productDetails.allowRfq && (
            <>
            <div className="col-md-12 editorSection">
              <h5 className="editorSectionTitle">Step 2: RFQ pricing & specifications</h5>
              <p className="editorSectionHint">Add MOQ tiers and product attributes so buyers understand your quotation structure.</p>
            </div>
            <div className="col-md-12">
              <label>Pricing blocks (shown in client RFQ pricing)</label><br />
              {(productDetails['rfqTiers'] || []).map((obj, key) => (
                <div key={key} className='variantBox'>
                  <div className='row'>
                    <div className="col-md-3">
                      <label>Minimum quantity</label>
                      <input type="number" value={obj.minQty} onChange={(e) => {
                        var newArr = [...(productDetails['rfqTiers'] || [])]
                        newArr[key].minQty = e.target.value
                        setProductDetails({ ...productDetails, rfqTiers: newArr })
                      }} required />
                    </div>
                    <div className="col-md-3">
                      <label>Maximum quantity (optional)</label>
                      <input type="number" value={obj.maxQty} onChange={(e) => {
                        var newArr = [...(productDetails['rfqTiers'] || [])]
                        newArr[key].maxQty = e.target.value
                        setProductDetails({ ...productDetails, rfqTiers: newArr })
                      }} />
                    </div>
                    <div className="col-md-3">
                      <label>Quote price</label>
                      <input type="number" value={obj.price} onChange={(e) => {
                        var newArr = [...(productDetails['rfqTiers'] || [])]
                        newArr[key].price = e.target.value
                        setProductDetails({ ...productDetails, rfqTiers: newArr })
                      }} required />
                    </div>
                    <div className="col-md-3">
                      <label>Action</label><br />
                      <button type='button' onClick={() => {
                        setProductDetails({
                          ...productDetails,
                          rfqTiers: (productDetails['rfqTiers'] || []).filter((_, index) => index !== key)
                        })
                      }}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
              <button className="editorAddBtn" data-for="variantAdd" type='button' onClick={() => {
                setProductDetails({
                  ...productDetails,
                  rfqTiers: [...(productDetails.rfqTiers || []), {
                    minQty: '',
                    maxQty: '',
                    price: ''
                  }]
                })
              }}>Add pricing block</button>
            </div>

            <div className="col-md-12 mt-3">
              <label>Specifications (shown in "Specifications" tab)</label><br />
              <p className="editorFieldHint">You can add up to 20 specification rows.</p>
              {(productDetails['rfqAttributes'] || []).map((obj, key) => (
                <div key={key} className='variantBox mb-2 p-2'>
                  <div className='row'>
                    <div className="col-md-5">
                        <label>Specification name (e.g. Type, Material)</label>
                        <input type="text" value={obj.key} onChange={(e) => {
                        var newArr = [...(productDetails['rfqAttributes'] || [])]
                        newArr[key].key = e.target.value
                        setProductDetails({ ...productDetails, rfqAttributes: newArr })
                        }} required />
                    </div>
                    <div className="col-md-5">
                        <label>Specification value</label>
                        <input type="text" value={obj.value} onChange={(e) => {
                        var newArr = [...(productDetails['rfqAttributes'] || [])]
                        newArr[key].value = e.target.value
                        setProductDetails({ ...productDetails, rfqAttributes: newArr })
                        }} required />
                    </div>
                    <div className="col-md-2">
                        <label>Action</label><br />
                        <button type='button' className="btn-sm" onClick={() => {
                        setProductDetails({
                            ...productDetails,
                            rfqAttributes: (productDetails['rfqAttributes'] || []).filter((_, index) => index !== key)
                        })
                        }}>Remove</button>
                    </div>
                   </div>
                </div>
              ))}
              {(productDetails['rfqAttributes'] || []).length < 20 && (
                <button className="editorAddBtn" data-for="variantAdd" type='button' onClick={() => {
                    setProductDetails({
                    ...productDetails,
                    rfqAttributes: [...(productDetails.rfqAttributes || []), { key: '', value: '' }]
                    })
                }}>Add specification</button>
              )}
            </div>

            <div className="col-md-12 mt-3">
                <label>Customization Option Available?</label><br/>
                <select value={productDetails.rfqCustomization} onChange={(e) => {
                    setProductDetails({ ...productDetails, rfqCustomization: e.target.value === 'true' })
                }}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>
                {productDetails.rfqCustomization && (
                    <div className="mt-2">
                        <label>Customization Details / Description</label><br/>
                        <textarea rows="3" style={{width: '100%'}} value={productDetails.rfqCustomizationDesc || ''} onChange={(e) => {
                             setProductDetails({ ...productDetails, rfqCustomizationDesc: e.target.value })
                        }} placeholder="E.g., Logo/graphic design(+ from +₹4.74/piece/Min. order: 500 pieces)"></textarea>
                    </div>
                )}
            </div>

            <div className="col-md-12 mt-3 mb-4">
                <label>Handling Time (separate from lead time)</label><br/>
                <textarea rows="2" style={{width: '100%'}} value={productDetails.rfqHandlingTime || ''} onChange={(e) => {
                    setProductDetails({ ...productDetails, rfqHandlingTime: e.target.value })
                }} placeholder="E.g., Ships in 5 business days"></textarea>
            </div>

            <div className="col-md-12 mt-1 mb-4">
                <label>Lead Time Description</label><br/>
                <textarea rows="3" style={{width: '100%'}} value={productDetails.rfqLeadTime || ''} onChange={(e) => {
                    setProductDetails({ ...productDetails, rfqLeadTime: e.target.value })
                }} placeholder="E.g., Quantity (pieces) 1 - 50,000 : 31 days | > 50,000 : To be negotiated"></textarea>
            </div>

            <div className="col-md-12 mt-3">
              <label>Certificates / compliance labels</label><br />
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
                      <button type="button" onClick={() => {
                        setProductDetails({
                          ...productDetails,
                          rfqCertificates: (productDetails.rfqCertificates || []).filter((_, i) => i !== key)
                        })
                      }}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
              <button className="editorAddBtn" type="button" data-for="variantAdd" onClick={() => {
                setProductDetails({
                  ...productDetails,
                  rfqCertificates: [...(productDetails.rfqCertificates || []), { name: '', description: '' }]
                })
              }}>Add certificate</button>
            </div>
            </>
          )}
          <div className="col-md-12 editorSection">
            <h5 className="editorSectionTitle">Step 3: Variants</h5>
            <p className="editorSectionHint">Define size/option-wise pricing and upload variant images if available.</p>
          </div>
          <div className="col-md-12 variantEditorSection">
            <label>Variants</label><br />
            {
              productDetails['variant'] && productDetails['variant'].length > 0 && (
                <>
                  {
                    productDetails['variant'].map((obj, key) => {
                      return (
                        <div key={key} className='variantBox' >
                          <div className='row' >
                            <div className="col-lg-3 col-md-6">
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
                            <div className="col-lg-2 col-md-6">
                              <label>Price</label>
                              <input type="number" value={obj.price} onChange={(e) => {
                                var newArr = [...productDetails['variant']]
                                newArr[key].price = e.target.value
                                setProductDetails({
                                  ...productDetails,
                                  variant: newArr
                                })
                              }} required />
                            </div>
                            <div className="col-lg-2 col-md-6">
                              <label>MRP</label>
                              <input type="number" value={obj.mrp} onChange={(e) => {
                                var newArr = [...productDetails['variant']]
                                newArr[key].mrp = e.target.value
                                setProductDetails({
                                  ...productDetails,
                                  variant: newArr
                                })
                              }} required />
                            </div>
                            <div className="col-lg-5 col-md-6">
                              <div className="row">
                                <div className="col-8 col-md-8">
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
                                  <div className="col-4 col-md-4">
                                    <label>Action</label><br />
                                    <button className="editorRemoveBtn" type='button' onClick={() => {
                                      setProductDetails({
                                        ...productDetails,
                                        variant: productDetails['variant'].filter((old) => {
                                          return old.id !== obj.id
                                        })
                                      })
                                    }} >Remove</button>
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
                </>
              )
            }
            <button className="editorAddBtn" data-for="variantAdd" type='button' onClick={() => {
              if (productDetails['variant']) {
                setProductDetails({
                  ...productDetails,
                  variant: [...productDetails.variant, {
                    size: 'S',
                    price: productDetails.price,
                    mrp: productDetails.mrp,
                    details: '',
                    id: new ObjectId().toHexString()
                  }]
                })
              } else {
                setProductDetails({
                  ...productDetails,
                  variant: [{
                    size: 'S',
                    price: productDetails.price,
                    mrp: productDetails.mrp,
                    details: '',
                    id: new ObjectId().toHexString()
                  }]
                })
              }
            }} >Add Variant</button>
          </div>

          <div className='col-12 editorSection'>
            <h5 className="editorSectionTitle">Step 4: Category & media</h5>
            <p className="editorSectionHint">Choose the right category and keep image slots clean for best discoverability.</p>
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

              <option value={JSON.stringify({ name: productDetails.category, slug: productDetails.categorySlug })}>{productDetails.category}</option>

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

          <div className='col-12 mb-2'>
            <label className="form-label fw-bold">Product images (max {MAX_PRODUCT_IMAGES})</label>
            <p className="vendorDimHint mb-0">Replace any slot · recommended 1000×1000px (1:1) or 1200×900px</p>
          </div>

          <div className="col-12 mb-4">
            <div className="vendorPreviewGrid">
              {
                images.map((obj, key) => (
                  <div className="vendorPreviewTile" key={key}>
                    <img src={obj} alt="" />
                    <span className="vendorPreviewLabel">{key === 0 ? 'Cover' : `Image ${key + 1}`}</span>
                    <label
                      className="position-absolute bottom-0 start-0 end-0 m-0"
                      style={{ cursor: 'pointer' }}
                    >
                      <span
                        className="d-block text-center py-2 small fw-semibold text-white"
                        style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.75))' }}
                      >
                        <i className="fa-solid fa-camera me-1" aria-hidden></i>
                        Replace
                      </span>
                      <input
                        accept="image/*"
                        className="d-none"
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          var serverimg = [...serverImg]
                          var oldArray = [...images]
                          oldArray[key] = URL.createObjectURL(file)
                          setImages(oldArray)

                          var Uplimgs = [...uplodImages]
                          Uplimgs.push(file)
                          setUploadImg(Uplimgs)

                          var DeleteImgs = [...delImages]
                          DeleteImgs.push(serverimg[key].filename)
                          setDelImg(DeleteImgs)

                          serverimg[key].filename = productDetails.uni_id_1 + file.name
                          setServerImg(serverimg)
                          e.target.value = ''
                        }}
                      />
                    </label>
                  </div>
                ))
              }
            </div>
          </div>

          <div className='col-12 editorSection'>
            <h5 className="editorSectionTitle">Step 5: SEO & descriptions</h5>
            <p className="editorSectionHint">Improve search ranking and conversion with complete SEO and rich descriptions.</p>
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
            <div className="editorSubmitRow">
              <button className='vendorBtnPrimary editorSubmitPrimary'>
                <i className="fa-solid fa-cloud-arrow-up me-2"></i>
                Save product
              </button>
            </div>
          </div>

        </div>

      </form>
    </div>
  )
}

export default EditProduct
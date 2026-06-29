import React, { useState, useRef, useEffect, useCallback, Fragment } from 'react'
import { useContext } from 'react';
import Link from 'next/link';
import Server, { ServerId, userAxios } from '../../../Config/Server';
import style from './ResultComp.module.scss'
import { useRouter } from 'next/router';
import ContentControl from '@/ContentControl/ContentControl';
import toast from 'react-hot-toast';
import CategoryPath from '@/Component/Common/CategoryPath';

function ResultComp({
  setPageNum, products,
  response, category,
  setFilter, filter,
  setProducts, setResponse,
  pageNum, search }) {

  var pages = response.pages

  var categories = response.categories

  const navigate = useRouter()

  const { setQuickVw, QuickVw,
    setLoginModal, setUserLogged } = useContext(ContentControl)
  // AI Requirement Search — disabled (not needed)
  // const [aiQuery, setAiQuery] = useState('')
  // const [appliedAiQuery, setAppliedAiQuery] = useState('')

  function LogOut() {
    setUserLogged(user => ({
      ...user,
      status: false,
    }))
    localStorage.removeItem('token')
  }

  const displayedProducts = products

  return (
    <div className={style.ResultComp + ' container'}>

      <div className={style.rowGridDesk}>

        {/* ── FILTER SIDEBAR ── */}
        <div className={style.filterArea}>
          {/* AI Requirement Search — disabled (not needed)
          <div className={style.filterItem}>
            <h6>AI Requirement Search</h6>
            <textarea
              className={style.searchInput}
              rows={3}
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Describe your business need in natural language"
            />
            <button
              type="button"
              className={style.aiSearchBtn}
              onClick={() => {
                setAppliedAiQuery(aiQuery);
                setPageNum(1);
              }}
            >
              Search Requirements
            </button>
          </div>
          */}
          <div className={style.filterItem}>
            <h6>PRODUCT CATEGORIES</h6>
            <div>
              <select onChange={(e) => {
                if (category) {
                  navigate.push(`/c/${e.target.value}`)
                  setPageNum(1)
                  setFilter({ ...filter, category: e.target.value })
                } else {
                  setPageNum(1)
                  setFilter({ ...filter, seCategory: e.target.value })
                }
              }} className={style.selectBox} defaultValue={category || filter.seCategory}>
                {
                  category ? (
                    <option value={category}>{category.replace(/-/g, ' ').toUpperCase()}</option>
                  ) : (
                    filter.seCategory !== '' && (
                      <option value={filter.seCategory}>{filter.seCategory.replace(/-/g, ' ').toUpperCase()}</option>
                    )
                  )
                }
                {
                  categories.map((obj, key) => {
                    return (
                      <Fragment key={key}>
                        <option value={obj.slug}>{obj.name}</option>
                        {obj.mainSub.map((obj2, key2) => (
                          <option key={key2} value={obj2.slug}>&nbsp;&nbsp;↳ {obj2.name}</option>
                        ))}
                        {obj.sub.map((obj3, key3) => (
                          <option key={key3} value={obj3.slug}>&nbsp;&nbsp;&nbsp;&nbsp;↳ {obj3.name}</option>
                        ))}
                      </Fragment>
                    )
                  })
                }
              </select>
            </div>
          </div>
        </div>

        {/* ── PRODUCTS AREA ── */}
        <div className={style.ProductsArea}>
          {
            response.showNot ? (
              <div className='text-center pt-5 pb-5'>
                <i className="fa-solid fa-box-open fa-3x text-muted mb-4" style={{ opacity: 0.3 }}></i>
                <h4 className='font-bold' style={{ color: '#1A3C5E' }}>No Products Found</h4>
                <p className='text-muted'>Try adjusting your filters or browse other categories.</p>
              </div>
            ) : (
              <>
                <div className={style.sortDiv}>
                  <p className={'text-small UserGrayMain pt-1 ' + style.sortCount}>
                    <strong>{displayedProducts.length}</strong> products found
                  </p>
                  <div>
                    <select value={JSON.stringify(filter.sort)} className={style.selectBox} onChange={(e) => {
                      setFilter({ ...filter, sort: JSON.parse(e.target.value) })
                    }}>
                      <option value={JSON.stringify({ '_id': -1 })}>Latest</option>
                      <option value={JSON.stringify({ 'price': 1 })}>Price: Low to High</option>
                      <option value={JSON.stringify({ 'price': -1 })}>Price: High to Low</option>
                    </select>
                  </div>
                </div>

                <div className={style.products}>
                  {
                    displayedProducts.length === 0 ? (
                      <div className={style.noMatchCard}>
                        <h5>No exact product match found</h5>
                        <p>
                          Try a clearer requirement sentence like material, MOQ, budget, or delivery timeline. You can also check another category.
                        </p>
                      </div>
                    ) : displayedProducts.map((obj, key) => (
                      <div className={style.UserMainProCard} key={key}>
                        <div className={style.UserMainProimgDiv}>
                          {obj.discount > 0 && <span className={style.offerGreen}>{obj.discount}%</span>}
                          <Link className='LinkTagNonDec' href={'/p/' + obj.slug + '/' + obj._id}>
                            <img src={ServerId + '/product/' + obj.uni_id_1 + obj.uni_id_2 + '/' + obj.files[0].filename} alt={obj.name} loading="lazy" />
                          </Link>
                        </div>
                        
                        <div className='pt-2 textArea d-flex flex-column flex-grow-1 justify-content-between'>
                          <Link className='LinkTagNonDec' href={'/p/' + obj.slug + '/' + obj._id}>
                            <div>
                              <CategoryPath category={obj.category} variant="card" />
                              <h6 className={style.oneLineTxt + ' ' + style.productTitle}>{obj.name}</h6>
                              {obj.available === "true" ? (
                                <div className={style.PriceSpan}>
                                  <span className={style.mrp}><del>₹ {obj.mrp}</del></span>
                                  <span className={style.sale}>₹ {obj.price}</span>
                                </div>
                              ) : (
                                <div className={style.PriceSpan}><span className={style.enquiryText}>Unavailable</span></div>
                              )}
                            </div>
                          </Link>

                          <div className={style.actionButtons}>
                            <button className={style.quickViewBtn} onClick={() => {
                              Server.get('/users/product/' + obj.slug + '/' + obj._id).then((item) => {
                                setQuickVw({ ...QuickVw, active: true, btn: true, product: item.data.product })
                              }).catch(() => toast.error('Facing An Error'))
                            }}>
                              Quick View
                            </button>

                            {obj.available === "true" ? (
                                <button className={style.addToCartBtn} onClick={() => {
                                  if (!userLogged.status) {
                                    setLoginModal(obj => ({ ...obj, btn: true, active: true, member: true, forgot: false }))
                                    return
                                  }
                                  userAxios((server) => {
                                    server.post('/users/addToCart', {
                                      item: {
                                        quantity: 1,
                                        proId: obj._id,
                                        price: obj.price,
                                        mrp: obj.mrp,
                                        variantSize: obj.currVariantSize || '',
                                      },
                                    }).then((res) => {
                                      if (res.data.login) {
                                        LogOut()
                                        setLoginModal(o => ({ ...o, btn: true, active: true, member: true, forgot: false }))
                                      } else if (res.data.found) {
                                        toast.error('Already in cart')
                                      } else {
                                        toast.success('Added to cart')
                                        setCartTotal(amt => amt + (obj.price || 0))
                                      }
                                    }).catch(() => setLoginModal(o => ({ ...o, btn: true, active: true, member: true, forgot: false })))
                                  })
                                }}>
                                  Add to Cart
                                </button>
                              ) : (
                                <button className={style.addToCartBtnDisabled} disabled>
                                  Unavailable
                                </button>
                              )
                            }
                          </div>
                        </div>

                      </div>
                    ))
                  }
                </div>

                {
                  response.pagination && (
                    <div className={style.paginationDiv}>
                      <div className={style.pagination}>
                        {
                          pages.map((obj, key) => (
                            <button key={key} onClick={() => setPageNum(obj)}
                              className={response.currentPage === obj ? style.active : ''}>
                              {obj}
                            </button>
                          ))
                        }
                      </div>
                    </div>
                  )
                }
              </>
            )
          }
        </div>

      </div>
    </div>
  )
}

export default ResultComp
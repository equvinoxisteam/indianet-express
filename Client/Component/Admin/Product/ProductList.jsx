import Loading from '@/Component/Loading/Loading'
import ContentControl from '@/ContentControl/ContentControl'
import { useRouter } from 'next/router'
import { Fragment, useContext, useEffect, useState } from 'react'
import Server, { adminAxios, ServerId } from '../../../Config/Server'
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

function ProductList({ loaded, setLoaded }) {

    const { setAdminLogged } = useContext(ContentControl)

    const [responseServer, setResponse] = useState({
        pagination: false
    })

    const [update, setUpdate] = useState(false)
    const [search, setSearch] = useState('')
    const [pages, setPages] = useState([])
    const [products, setProducts] = useState([])

    const navigate = useRouter()

    const logOut = () => {
        setAdminLogged({ status: false })
        localStorage.removeItem("adminToken")
        setLoaded(true)
        navigate.push('/admin/login')
    }

    useEffect(() => {
        setLoaded(false)
        const searchQuery = navigate.query.search || search;
        adminAxios((server) => {
            server.get('/admin/getProducts', {
                params: {
                    page: 1,
                    search: searchQuery || null
                }
            }).then((response) => {
                if (response.data.login) {
                    logOut()
                } else {
                    setProducts(response.data.data)
                    setResponse(response.data)
                    setPages(response.data.pages)
                }
            }).catch((err) => {
                console.log("error")
            })
        })
        setLoaded(true)
    }, [update, navigate.query.search])

    function searchProduct(e) {
        e.preventDefault()
        navigate.push(`/admin/products?search=${search}`)
    }

    return (
        <>
            {
                loaded ? (
                    <div className='AdminContainer'>
                        <div className='pt-3 ProductListAdmin'>
                            <div className='TitleGrid d-flex justify-content-between align-items-center mb-4'>
                                <h5 className='UserBlackMain font-bold mb-0'>PRODUCTS — ALL VENDORS &amp; PLATFORM</h5>
                                <button className='btn btn-primary rounded-pill px-4' onClick={() => navigate.push('/admin/products/add')}>
                                    <i className="fa-solid fa-plus me-2"></i> Add Product
                                </button>
                            </div>

                            {responseServer.showNot ? (
                                <div className='text-center pt-5'>
                                    <h3 className='font-bold text-muted'>No Products Found</h3>
                                </div>
                            ) : (
                                <Fragment>
                                    <div className='searchDiv mb-4'>
                                        <form onSubmit={searchProduct}>
                                            <div className="input-group">
                                                <span className="input-group-text bg-white border-end-0"><i className="fa-solid fa-magnifying-glass text-muted"></i></span>
                                                <input 
                                                    className="form-control border-start-0" 
                                                    value={search} 
                                                    type="text" 
                                                    onChange={(e) => setSearch(e.target.value)} 
                                                    placeholder='Search by name, category...' 
                                                />
                                            </div>
                                        </form>
                                    </div>

                                    <div className='tableDiv mt-3'>
                                        <table className='table table-hover align-middle mb-0'>
                                            <thead className='table-light'>
                                                <tr>
                                                    <th style={{ minWidth: '90px' }}>Image</th>
                                                    <th style={{ minWidth: '240px' }}>Product</th>
                                                    <th style={{ minWidth: '120px' }}>Category</th>
                                                    <th style={{ minWidth: '220px' }}>Vendor</th>
                                                    <th style={{ minWidth: '140px' }}>Pricing</th>
                                                    <th style={{ minWidth: '150px' }}>Flags</th>
                                                    <th style={{ minWidth: '120px' }}>Stock</th>
                                                    <th style={{ minWidth: '140px' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {products.map((obj, key) => {
                                                    const fileName = obj.files?.[0]?.filename
                                                    const imageUrl = fileName
                                                        ? `${ServerId}/product/${obj.uni_id_1}${obj.uni_id_2}/${fileName}`
                                                        : null
                                                    return (
                                                        <tr key={key}>
                                                            <td>
                                                                {imageUrl ? (
                                                                    <img
                                                                        src={imageUrl}
                                                                        alt={obj.name}
                                                                        style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                                                    />
                                                                ) : (
                                                                    <div className='d-flex align-items-center justify-content-center bg-light text-muted'
                                                                        style={{ width: '64px', height: '64px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                                                        <i className="fa-regular fa-image"></i>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <div className='fw-semibold'>{obj.name}</div>
                                                                <div className='small text-muted text-truncate' style={{ maxWidth: '220px' }}>{obj.slug}</div>
                                                            </td>
                                                            <td>
                                                                <span className='small text-muted'>{obj.category}</span>
                                                            </td>
                                                            <td>
                                                                <div className='small'><i className="fa-solid fa-user me-1"></i>{obj.vendorName || 'N/A'}</div>
                                                                {obj.vendorEmail && obj.vendorEmail !== 'N/A' && (
                                                                    <div className='small text-muted text-truncate' style={{ maxWidth: '220px' }}><i className="fa-solid fa-envelope me-1"></i>{obj.vendorEmail}</div>
                                                                )}
                                                                {obj.vendorPhone && obj.vendorPhone !== 'N/A' && (
                                                                    <div className='small text-muted'><i className="fa-solid fa-phone me-1"></i>{obj.vendorPhone}</div>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <div className='fw-semibold text-primary'>Rs. {obj.price}</div>
                                                                <div className='small text-muted'><del>Rs. {obj.mrp}</del></div>
                                                                <div className='small text-success fw-semibold'>{obj.discount}% off</div>
                                                            </td>
                                                            <td>
                                                                <div className='d-flex flex-wrap gap-1'>
                                                                    {obj.allowCod !== false && <span className="badge bg-success-subtle text-success border border-success-subtle">COD</span>}
                                                                    {obj.allowOnline !== false && <span className="badge bg-primary-subtle text-primary border border-primary-subtle">ONLINE</span>}
                                                                    {obj.allowRfq === true && <span className="badge bg-dark-subtle text-dark border border-dark-subtle">RFQ</span>}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                {obj.available === 'true'
                                                                    ? <span className="badge bg-success rounded-pill">In Stock</span>
                                                                    : <span className="badge bg-danger rounded-pill">Out of Stock</span>
                                                                }
                                                            </td>
                                                            <td>
                                                                <div className='d-flex gap-1'>
                                                                    <button className='btn btn-sm btn-outline-secondary' title="View" onClick={() => window.open(`/p/${obj.slug}/${obj._id}`, '_blank')}>
                                                                        <i className="fa-solid fa-eye"></i>
                                                                    </button>
                                                                    <button className='btn btn-sm btn-outline-primary' title="Edit" onClick={() => navigate.push('/admin/products/edit/' + obj._id)}>
                                                                        <i className="fa-solid fa-pen-to-square"></i>
                                                                    </button>
                                                                    <button className='btn btn-sm btn-outline-danger' title="Delete" onClick={() => {
                                                                        Swal.fire({
                                                                            title: `Delete ${obj.name}?`,
                                                                            text: "This action cannot be undone.",
                                                                            icon: 'warning',
                                                                            showCancelButton: true,
                                                                            confirmButtonColor: '#d33',
                                                                            cancelButtonColor: '#3085d6',
                                                                            confirmButtonText: 'Yes, delete it!'
                                                                        }).then((result) => {
                                                                            if (result.isConfirmed) {
                                                                                adminAxios((server) => {
                                                                                    server.delete(`/admin/deleteProduct/${obj._id}`, {
                                                                                        data: { folderId: obj.uni_id_1 + obj.uni_id_2 }
                                                                                    }).then((res) => {
                                                                                        if (res.data.login) {
                                                                                            logOut()
                                                                                        } else {
                                                                                            toast.success("Product Deleted")
                                                                                            setUpdate(!update)
                                                                                        }
                                                                                    }).catch(() => toast.error("Server Error"))
                                                                                })
                                                                            }
                                                                        })
                                                                    }}>
                                                                        <i className="fa-solid fa-trash"></i>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </Fragment>
                            )}
                        </div>

                        {responseServer.pagination && (
                            <div className='d-flex justify-content-center mt-5 mb-4'>
                                <nav>
                                    <ul className="pagination">
                                        {pages.map((obj, key) => (
                                            <li className={`page-item ${responseServer.currentPage === obj ? 'active' : ''}`} key={key}>
                                                <button className="page-link" onClick={() => {
                                                    const searchQuery = navigate.query.search || '';
                                                    adminAxios((server) => {
                                                        server.get('/admin/getProducts', {
                                                            params: { page: obj, search: searchQuery }
                                                        }).then((response) => {
                                                            if (response.data.login) {
                                                                logOut()
                                                            } else {
                                                                setProducts(response.data.data)
                                                                setResponse(response.data)
                                                                setPages(response.data.pages)
                                                            }
                                                        }).catch(() => console.log("error"))
                                                    })
                                                }}>{obj}</button>
                                            </li>
                                        ))}
                                    </ul>
                                </nav>
                            </div>
                        )}
                    </div>
                ) : <Loading />
            }
        </>
    )
}

export default ProductList

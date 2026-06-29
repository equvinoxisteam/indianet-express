import db from '../Config/Connection.js'
import collections from '../Config/Collection.js'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcrypt'

async function resolveVendorDocById(vendorId) {
    if (!vendorId || !ObjectId.isValid(String(vendorId))) return null
    return db.get().collection(collections.VENDORS).findOne({ _id: ObjectId(String(vendorId)) })
}

async function resolveVendorDocForProduct(product) {
    if (product?.vendorId) {
        const byVendorId = await resolveVendorDocById(product.vendorId)
        if (byVendorId) return byVendorId
    }
    if (product?.vendor && product.vendor !== true && product.vendor !== false) {
        return resolveVendorDocById(product.vendor)
    }
    return null
}

function vendorDisplayFields(vendor) {
    if (!vendor) {
        return {
            vendorName: 'Platform (Admin)',
            vendorEmail: 'N/A',
            vendorPhone: 'N/A',
            vendorWebsite: '',
            vendorLogo: '',
            vendorBackground: '',
            vendorDescription: '',
        }
    }
    return {
        vendorName: vendor.companyName || vendor.adharName || vendor.name || 'Vendor',
        vendorEmail: vendor.email || 'N/A',
        vendorPhone: vendor.number || vendor.phone || 'N/A',
        vendorWebsite: vendor.website || '',
        vendorLogo: vendor.logo || '',
        vendorBackground: vendor.backgroundImage || '',
        vendorDescription: vendor.description || '',
    }
}

async function enrichProductWithVendor(product) {
    const vendor = await resolveVendorDocForProduct(product)
    return { ...product, ...vendorDisplayFields(vendor) }
}

async function enrichProductsWithVendor(products) {
    return Promise.all((products || []).map(enrichProductWithVendor))
}

async function enrichOrdersWithVendor(orders) {
    const vendorIds = [...new Set((orders || []).map((o) => String(o.vendorId || '')).filter(Boolean))]
    const vendorMap = {}
    if (vendorIds.length) {
        const objectIds = vendorIds.filter((id) => ObjectId.isValid(id)).map((id) => ObjectId(id))
        if (objectIds.length) {
            const vendors = await db.get().collection(collections.VENDORS).find({ _id: { $in: objectIds } }).toArray()
            for (const v of vendors) {
                vendorMap[String(v._id)] = v.companyName || v.adharName || v.name || 'Vendor'
            }
        }
    }
    return (orders || []).map((o) => ({
        ...o,
        vendorName: o.vendorId ? (vendorMap[String(o.vendorId)] || 'Vendor') : 'Platform',
    }))
}

export default {
    getAllOrders: ({ search, skip }, limit) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collections.ORDERS).aggregate([
                {
                    $unwind: '$order'
                }, {
                    $project: {
                        userId: '$_id',
                        date: '$order.date',
                        product: {
                            $toString: '$order.product'
                        },
                        secretOrderId: '$order.secretOrderId',
                        customer: '$order.details.name',
                        payStatus: '$order.payStatus',
                        payType: '$order.details.payType',
                        OrderId: '$order.OrderId',
                        OrderStatus: '$order.OrderStatus',
                        price: '$order.price',
                        proName: '$order.proName',
                        vendorId: '$order.vendorId',
                    }
                }, {
                    $match: {
                        customer: {
                            $regex: search || '', $options: 'i'
                        }
                    }
                }, {
                    $sort: {
                        OrderId: -1
                    }
                }, {
                    $skip: parseInt(skip)
                }, {
                    $limit: limit
                }
            ]).toArray().catch(() => {
                reject()
            })

            if (orders) {
                const enriched = await enrichOrdersWithVendor(orders)
                resolve(enriched)
            } else {
                reject()
            }
        })
    },
    getTotalOrders: ({ search }) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collections.ORDERS).aggregate([
                {
                    $unwind: '$order'
                }, {
                    $project: {
                        customer: '$order.details.name',
                    }
                }, {
                    $match: {
                        customer: {
                            $regex: search || '', $options: 'i'
                        }
                    }
                }, {
                    $group: {
                        _id: null,
                        count: {
                            $sum: 1
                        }
                    }
                }
            ]).toArray().catch(() => {
                reject()
            })

            if (total) {
                if (total.length !== 0) {
                    resolve(total[0].count)
                } else {
                    resolve(0)
                }
            } else {
                reject()
            }
        })
    },
    getOrderSpecific: ({ orderId, userId }) => {
        return new Promise(async (resolve, reject) => {
            if (userId.length === 24) {
                let order = await db.get().collection(collections.ORDERS).aggregate([
                    {
                        $match: {
                            _id: ObjectId(userId)
                        }
                    }, {
                        $unwind: '$order'
                    }, {
                        $match: {
                            'order.secretOrderId': orderId
                        }
                    }, {
                        $project: {
                            userId: userId,
                            proName: '$order.proName',
                            proId: '$order.product',
                            secretOrderId: orderId,
                            created: '$order.date',
                            quantity: '$order.quantity',
                            price: '$order.price',
                            mrp: '$order.mrp',
                            order_id_shiprocket: '$order.order_id_shiprocket',
                            shipment_id: '$order.shipment_id',
                            payId: '$order.payId',
                            OrderStatus: '$order.OrderStatus',
                            details: '$order.details',
                            updated: '$order.updated',
                            returnReason: '$order.returnReason',
                            slug: '$order.slug',
                            vendorId: '$order.vendorId',
                            variantSize: '$order.variantSize'
                        }
                    }
                ]).toArray().catch((err) => {
                    console.log(err)
                    reject()
                })

                if (order && order.length !== 0) {
                    resolve(order[0])
                } else {
                    reject()
                }
            } else {
                reject()
            }
        })
    },
    editOrder: ({ order_id_shiprocket, shipment_id, OrderStatus, userId, secretOrderId }, updated) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDERS).updateOne({
                _id: ObjectId(userId),
                'order.secretOrderId': secretOrderId
            }, {
                $set: {
                    'order.$.shipment_id': shipment_id,
                    'order.$.order_id_shiprocket': order_id_shiprocket,
                    'order.$.OrderStatus': OrderStatus,
                    'order.$.updated': updated
                }
            }).then((done) => {
                resolve()
            }).catch((err) => {
                reject()
            })
        })
    },
    getTotalVendors: (status) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collections.VENDORS)
                .countDocuments({
                    accept: status
                }).catch(() => {
                    reject()
                })

            resolve(total)
        })
    },
    getAllVendors: (status, skip, limit) => {
        return new Promise(async (resolve, reject) => {
            let vendors = await db.get().collection(collections.VENDORS)
                .find({
                    accept: status
                }).sort({ _id: -1 })
                .skip(parseInt(skip))
                .limit(limit).toArray().catch(() => {
                    reject()
                })

            resolve(vendors)
        })
    },
    acceptVendor: async (email) => {
        const vendor = await db.get().collection(collections.VENDORS).findOne({ email })
        if (!vendor) throw new Error('not_found')
        const { buildActivationFields } = await import('../Config/vendorPlans.js')
        const updates = { accept: true }
        if (!vendor.planStatus || vendor.planStatus === 'none') {
            Object.assign(updates, buildActivationFields('free'))
        }
        await db.get().collection(collections.VENDORS).updateOne({ email }, { $set: updates })
    },
    deleteVendor: (email) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.VENDORS).deleteOne({
                email: email
            }).then((data) => {
                if (data.deletedCount > 0) {
                    resolve(data)
                } else {
                    reject('err')
                }
            }).catch(() => {
                reject()
            })
        })
    },
    getSpecificVendor: (vendorId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.VENDORS).findOne({
                _id: ObjectId(vendorId)
            }).then((vendor) => {
                resolve(vendor)
            }).catch(() => {
                reject()
            })
        })
    },
    getSpecificVendorProductsTotal: ({ search, vendorId, skip }) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collections.PRODUCTS).countDocuments({
                name: {
                    $regex: search, $options: 'i'
                },
                vendor: true,
                vendorId: vendorId
            }).catch(() => {
                reject()
            })

            resolve(total)
        })
    },
    getSpecificVendorProducts: ({ search, vendorId, skip }, limit) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collections.PRODUCTS).find({
                name: {
                    $regex: search, $options: 'i'
                },
                vendor: true,
                vendorId: vendorId
            }).sort({ _id: -1 }).skip(parseInt(skip)).limit(limit).toArray().catch(() => {
                reject()
            })

            resolve(products)
        })
    },
    deleteProduct: (Id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCTS).deleteOne({
                _id: ObjectId(Id)
            }).then((data) => {
                if (data.deletedCount > 0) {
                    resolve(data)
                } else {
                    reject('err')
                }
            }).catch(() => {
                reject()
            })
        })
    },
    updateProduct: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCTS).updateOne({
                _id: ObjectId(data._id)
            }, {
                $set: {
                    name: data.name,
                    slug: data.slug,
                    price: data.price,
                    mrp: data.mrp,
                    available: data.available,
                    category: data.category,
                    categorySlug: data.categorySlug,
                    srtDescription: data.srtDescription,
                    description: data.description,
                    seoDescription: data.seoDescription,
                    seoKeyword: data.seoKeyword,
                    seoTitle: data.seoTitle,
                    vendor: false,
                    files: data.serverImg,
                    discount: data.discount,
                    return: data.return,
                    cancellation: data.cancellation,
                    pickup_location: data.pickup_location,
                    // ShipRocket shipment dimensions/weight
                    weightKg: data.weightKg,
                    lengthCm: data.lengthCm,
                    breadthCm: data.breadthCm,
                    heightCm: data.heightCm,
                    variant: data.variant,
                    variantDetails: data.variantDetails,
                    currVariantSize: data.currVariantSize,
                    allowCod: data.allowCod,
                    allowOnline: data.allowOnline,
                    allowRfq: data.allowRfq
                }
            }).then((done) => {
                resolve()
            }).catch((err) => {
                reject()
            })
        })
    },
    addProduct: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCTS).insertOne(details).then((done) => {
                resolve(done)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    addCategory: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CATEGORIES).insertOne(data).then((done) => {
                resolve(done)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    editCategory: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CATEGORIES).updateOne({
                _id: ObjectId(details.cateId)
            }, {
                $set: {
                    name: details.name,
                    slug: details.slug,
                    file: details.file
                }
            }).then((done) => {
                resolve(done)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    deleteCategory: (Id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CATEGORIES).deleteOne({
                _id: ObjectId(Id)
            }).then((data) => {
                if (data.deletedCount > 0) {
                    resolve(data)
                } else {
                    reject('err')
                }
            }).catch((err) => {
                reject(err)
            })
        })
    },
    addHeaderCategory: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CATEGORIES).updateOne({
                _id: ObjectId(details.cateId)
            }, {
                $set: {
                    header: details.header
                }
            }).then((done) => {
                resolve(done)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    addMainSubCategory: (details, cateId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CATEGORIES).updateOne({
                _id: ObjectId(cateId)
            }, {
                $push: { mainSub: details }
            }).then((done) => {
                resolve(done)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    addSubCategory: (details, cateId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CATEGORIES).updateOne({
                _id: ObjectId(cateId)
            }, {
                $push: {
                    sub: details
                }
            }).then((done) => {
                resolve(done)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    deleteMainSubCategory: (details, cateId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CATEGORIES).updateOne({
                _id: ObjectId(cateId)
            }, {
                $pull: {
                    mainSub: details
                }
            }).then((done) => {
                resolve(done)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    deleteSubCategory: (details, cateId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CATEGORIES).updateOne({
                _id: ObjectId(cateId)
            }, {
                $pull: {
                    sub: details
                }
            }).then((done) => {
                resolve(done)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    getAdminProducts: (skip, limit) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collections.PRODUCTS).find({}).sort({ _id: -1 }).skip(skip).limit(limit).toArray().catch((err) => {
                reject(err)
            })
            resolve(await enrichProductsWithVendor(products))
        })
    },
    getProductCount: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCTS).countDocuments({}).then((count) => {
                resolve(count)
            }).catch((err) => {
                console.log(err)
            })
        })
    },
    getProductCountAdminSearch: (search) => {
        return new Promise((resolve, reject) => {
            const query = search
                ? { name: { $regex: search, $options: 'i' } }
                : {}
            db.get().collection(collections.PRODUCTS).countDocuments(query).then((count) => {
                resolve(count)
            }).catch((err) => {
                console.log(err)
                reject(err)
            })
        })
    },
    getAdminProductsSearch: (search, skip, limit) => {
        return new Promise(async (resolve, reject) => {
            const query = search
                ? { name: { $regex: search, $options: 'i' } }
                : {}
            let products = await db.get().collection(collections.PRODUCTS).find(query).sort({ _id: -1 }).skip(skip).limit(limit).toArray().catch((err) => {
                reject(err)
            })
            resolve(await enrichProductsWithVendor(products))
        })
    },
    addCupon: (details) => {
        return new Promise(async (resolve, reject) => {
            let cupon = await db.get().collection(collections.CUPONS).findOne({
                code: details.code
            }).catch(() => {
                reject()
            })

            if (!cupon) {
                db.get().collection(collections.CUPONS).insertOne(details).then(() => {
                    resolve()
                }).catch(() => {
                    reject()
                })
            } else {
                reject()
            }
        })
    },
    getCupons: () => {
        return new Promise(async (resolve, reject) => {
            let cupons = await db.get().collection(collections.CUPONS).find().toArray().catch(() => {
                reject()
            })

            resolve(cupons)
        })
    },
    deleteCupon: (Id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CUPONS).deleteOne({
                _id: ObjectId(Id)
            }).then((data) => {
                if (data.deletedCount > 0) {
                    resolve()
                } else {
                    reject()
                }
            }).catch(() => {
                reject()
            })
        })
    },
    hideVendorProducts: (vendorId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCTS).updateMany({
                vendorId: vendorId
            }, {
                $set: {
                    available: "false"
                }
            }).then(() => {
                resolve()
            }).catch(() => {
                reject()
            })
        })
    },
    getDashboardTotal: () => {
        return new Promise(async (resolve, reject) => {
            let totalDelivered = await db.get().collection(collections.ORDERS).aggregate([
                {
                    $unwind: '$order'
                }, {
                    $match: {
                        'order.OrderStatus': 'Delivered'
                    }
                }, {
                    $group: {
                        _id: 'Delivered',
                        count: {
                            $sum: 1
                        }
                    }
                }
            ]).toArray().catch(() => {
                reject()
            })

            let totalReturn = await db.get().collection(collections.ORDERS).aggregate([
                {
                    $unwind: '$order'
                }, {
                    $match: {
                        'order.OrderStatus': 'Return'
                    }
                }, {
                    $group: {
                        _id: 'Return',
                        count: {
                            $sum: 1
                        }
                    }
                }
            ]).toArray().catch(() => {
                reject()
            })

            let totalCancelled = await db.get().collection(collections.ORDERS).aggregate([
                {
                    $unwind: '$order'
                }, {
                    $match: {
                        'order.OrderStatus': 'Cancelled'
                    }
                }, {
                    $group: {
                        _id: 'Cancelled',
                        count: {
                            $sum: 1
                        }
                    }
                }
            ]).toArray().catch(() => {
                reject()
            })

            let totalAmount = await db.get().collection(collections.ORDERS).aggregate([
                {
                    $unwind: '$order'
                }, {
                    $match: {
                        'order.OrderStatus': 'Delivered'
                    }
                }, {
                    $group: {
                        _id: 'Amount',
                        amount: {
                            $sum: '$order.price'
                        }
                    }
                }
            ]).toArray().catch(() => {
                reject()
            })

            if (Array.isArray(totalDelivered) && Array.isArray(totalReturn)
                && Array.isArray(totalCancelled) && Array.isArray(totalAmount)
            ) {

                if (totalAmount.length == 0) {
                    totalAmount[0] = { amount: 0 }
                }

                if (totalDelivered.length == 0) {
                    totalDelivered[0] = { count: 0 }
                }

                if (totalCancelled.length == 0) {
                    totalCancelled[0] = { count: 0 }
                }

                if (totalReturn.length == 0) {
                    totalReturn[0] = { count: 0 }
                }

                resolve({
                    totalAmount: totalAmount[0].amount,
                    totalDelivered: totalDelivered[0].count,
                    totalReturn: totalReturn[0].count,
                    totalCancelled: totalCancelled[0].count
                })
            } else {
                reject()
            }
        })
    },
    loginAdmin: ({ email, password }) => {
        return new Promise(async (resolve, reject) => {
            let admin = await db.get().collection(collections.ADMIN).findOne({
                email: email
            }).catch((err) => {
                reject(err)
            })

            if (admin !== null) {
                bcrypt.compare(password, admin.password).then((status) => {
                    if (status) {
                        resolve({ login: true, admin })
                    } else {
                        resolve({ login: false })
                    }
                }).catch((err) => {
                    reject(err)
                })
            } else {
                resolve({ login: false })
            }
        })
    },
    getAdmin: (Id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ADMIN).findOne({
                _id: ObjectId(Id)
            }).then((data) => {
                resolve(data)
            }).catch(() => {
                reject()
            })
        })
    }
}
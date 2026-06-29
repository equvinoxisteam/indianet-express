import db from '../Config/Connection.js'
import collections from '../Config/Collection.js'
import { ObjectId } from 'mongodb'

export default {
    addVendor: (details) => {
        return new Promise(async (resolve, reject) => {
            let vendor = await db.get().collection(collections.VENDORS).findOne({
                email: details.email
            }).catch(() => {
                reject()
            })

            if (!vendor) {
                db.get().collection(collections.VENDORS).insertOne(details).then(() => {
                    resolve({
                        found: false
                    })
                }).catch(() => {
                    reject()
                })
            } else {
                resolve({
                    found: true
                })
            }
        })
    },
    updateVendorProfile: (vendorId, profileData) => {
        return new Promise((resolve, reject) => {
            try {
                const setDoc = {
                    website: profileData.website || '',
                    description: profileData.description || '',
                    companyInfo: profileData.companyInfo || '',
                    socialLinks: profileData.socialLinks || {},
                    companyIntroduction: profileData.companyIntroduction || '',
                    businessType: profileData.businessType || '',
                    yearsInIndustry: profileData.yearsInIndustry || '',
                    cooperatedSuppliers: profileData.cooperatedSuppliers || '',
                    countryRegion: profileData.countryRegion || '',
                    mainCategories: profileData.mainCategories || '',
                    mainMarkets: profileData.mainMarkets || [],
                    yearEstablished: profileData.yearEstablished || '',
                    employeesRange: profileData.employeesRange || '',
                    factorySizeRange: profileData.factorySizeRange || '',
                    annualOutputRange: profileData.annualOutputRange || '',
                    verificationTags: profileData.verificationTags || [],
                    companyHighlights: profileData.companyHighlights || [],
                    certificateImages: profileData.certificateImages || [],
                    designCustomization: profileData.designCustomization === true,
                    fullCustomization: profileData.fullCustomization === true,
                    annualRevenueNote: profileData.annualRevenueNote || '',
                    exhibitionsNote: profileData.exhibitionsNote || ''
                }
                if (profileData.backgroundImage) {
                    setDoc.backgroundImage = profileData.backgroundImage
                }
                if (profileData.logo) {
                    setDoc.logo = profileData.logo
                }
                db.get().collection(collections.VENDORS).updateOne(
                    { _id: new ObjectId(vendorId) },
                    { $set: setDoc }
                ).then((result) => {
                    resolve({ success: true })
                }).catch((err) => {
                    console.error('Error updating vendor profile:', err)
                    reject(err)
                })
            } catch (error) {
                console.error('Error in updateVendorProfile:', error)
                reject(error)
            }
        })
    },
    getVendorByUserId: (userId) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collections.VENDORS).findOne({
                    user: new ObjectId(userId)
                }).then((vendor) => {
                    resolve(vendor)
                }).catch((err) => {
                    reject(err)
                })
            } catch (error) {
                reject(error)
            }
        })
    },
    getVendorById: (vendorId) => {
        return new Promise((resolve, reject) => {
            try {
                if (!ObjectId.isValid(vendorId)) {
                    resolve(null)
                    return
                }
                db.get().collection(collections.VENDORS).findOne({
                    _id: new ObjectId(vendorId)
                }).then((vendor) => {
                    resolve(vendor)
                }).catch((err) => {
                    reject(err)
                })
            } catch (error) {
                reject(error)
            }
        })
    },
    checkVendorAccept: (email) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.VENDORS).findOne({
                email: email,
                accept: true
            }).then((user) => {
                if (user) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            }).catch(() => {
                reject()
            })
        })
    },
    checkOtp: (email, type, otpFor) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.OTP).findOne({
                email: email,
                type: type,
                for: otpFor
            }).then((data) => {
                resolve(data)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    insertOtp: (email, otp, type, otpFor) => {
        return new Promise((resolve, reject) => {
            const col = db.get().collection(collections.OTP)
            col.deleteMany({ email, type, for: otpFor }).then(() => {
                return col.insertOne({
                    createdAt: new Date(),
                    email,
                    otp: String(otp),
                    type,
                    for: otpFor,
                })
            }).then((done) => {
                resolve(done)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    matchOtp: ({ email, otp }, type, otpFor) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.OTP).findOne({
                email: email,
                otp: String(otp),
                type: type,
                for: otpFor
            }).then((data) => {
                if (data) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            }).catch((err) => {
                reject(err)
            })
        })
    },
    getVendorAccepted: (email) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.VENDORS).findOne({
                email: email,
                accept: true
            }).then((vendor) => {
                resolve(vendor)
            }).catch(() => {
                reject()
            })
        })
    },
    getVendor: (Id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.VENDORS).findOne({
                _id: ObjectId(Id)
            }).then((vendor) => {
                resolve(vendor)
            }).catch(() => {
                reject()
            })
        })
    },
    getOneProduct: (vendorId, proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCTS).findOne({
                _id: ObjectId(proId),
                vendor: true,
                vendorId: vendorId
            }).then((data) => {
                resolve(data)
            }).catch(() => {
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
    updateProduct: (data, vendorId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCTS).updateOne({
                _id: ObjectId(data._id),
                vendor: true,
                vendorId: vendorId
            }, {
                $set: {
                    name: data.name,
                    slug: data.slug,
                    price: data.price,
                    mrp: data.mrp,
                    available: data.available,
                    publishStatus: data.publishStatus || 'draft',
                    category: data.category,
                    categorySlug: data.categorySlug,
                    srtDescription: data.srtDescription,
                    description: data.description,
                    seoDescription: data.seoDescription,
                    seoKeyword: data.seoKeyword,
                    seoTitle: data.seoTitle,
                    vendor: true,
                    vendorId: vendorId,
                    files: data.serverImg,
                    discount: data.discount,
                    return: data.return,
                    cancellation: data.cancellation,
                    pickup_location: data.pickup_location,
                    pickupAddressId: data.pickupAddressId,
                    pickupLabel: data.pickupLabel,
                    pickupPinCode: data.pickupPinCode,
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
                    allowRfq: data.allowRfq,
                    rfqTiers: data.rfqTiers,
                    rfqAttributes: data.rfqAttributes,
                    rfqCustomization: data.rfqCustomization,
                    rfqCustomizationDesc: data.rfqCustomizationDesc,
                    rfqHandlingTime: data.rfqHandlingTime || '',
                    rfqLeadTime: data.rfqLeadTime,
                    rfqPackaging: data.rfqPackaging || {},
                    rfqCertificates: data.rfqCertificates || [],
                    isShowcase: data.isShowcase === true
                }
            }).then((done) => {
                resolve()
            }).catch((err) => {
                reject()
            })
        })
    },
    getVendorProducts: (skip, limit, vendorId) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collections.PRODUCTS).find({
                vendor: true,
                vendorId: vendorId
            }).sort({ _id: -1 }).skip(skip).limit(limit).toArray().catch((err) => {
                reject(err)
            })
            resolve(products)
        })
    },
    getProductVendorCount: (vendorId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCTS).countDocuments({
                vendor: true,
                vendorId: vendorId
            }).then((count) => {
                resolve(count)
            }).catch((err) => {
                console.log(err)
            })
        })
    },
    getProductCountVendorSearch: (search, vendorId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCTS).countDocuments({
                name: { $regex: search, $options: 'i' },
                vendor: true,
                vendorId: vendorId
            }).then((count) => {
                resolve(count)
            }).catch((err) => {
                console.log(err)
            })
        })
    },
    getVendorProductsSearch: (search, skip, limit, vendorId) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collections.PRODUCTS).find({
                name: { $regex: search, $options: 'i' },
                vendor: true,
                vendorId: vendorId
            }).sort({ _id: -1 }).skip(skip).limit(limit).toArray().catch((err) => {
                reject(err)
            })
            resolve(products)
        })
    },
    getPublicVendorProductCount: (vendorId, search) => {
        return new Promise((resolve, reject) => {
            const filter = { vendor: true, vendorId: vendorId, publishStatus: 'published' }
            if (search && String(search).trim()) {
                filter.name = { $regex: String(search).trim(), $options: 'i' }
            }
            db.get().collection(collections.PRODUCTS).countDocuments(filter).then((c) => {
                resolve(c)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    getPublicVendorProducts: (vendorId, skip, limit, search) => {
        return new Promise(async (resolve, reject) => {
            const filter = { vendor: true, vendorId: vendorId, publishStatus: 'published' }
            if (search && String(search).trim()) {
                filter.name = { $regex: String(search).trim(), $options: 'i' }
            }
            let products = await db.get().collection(collections.PRODUCTS).find(filter, {
                projection: {
                    name: 1, slug: 1, price: 1, mrp: 1, files: 1, uni_id_1: 1, uni_id_2: 1,
                    discount: 1, allowRfq: 1, rfqTiers: 1, category: 1, available: 1
                }
            }).sort({ _id: -1 }).skip(skip).limit(limit).toArray().catch((err) => {
                    reject(err)
                })
            resolve(products)
        })
    },
    deleteProduct: ({ proId, vendorId }) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCTS).deleteOne({
                _id: ObjectId(proId),
                vendor: true,
                vendorId: vendorId
            }).then((data) => {
                if (data.deletedCount > 0) {
                    resolve()
                } else {
                    reject()
                }
            }).catch((err) => {
                reject()
            })
        })
    },
    getAllOrders: ({ search, skip, vendorId }, limit) => {
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
                        vendorId: '$order.vendorId',
                    }
                }, {
                    $match: {
                        vendorId: vendorId,
                        customer: {
                            $regex: search, $options: 'i'
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
                resolve(orders)
            } else {
                reject()
            }
        })
    },
    getTotalOrders: ({ search, vendorId }) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collections.ORDERS).aggregate([
                {
                    $unwind: '$order'
                }, {
                    $project: {
                        customer: '$order.details.name',
                        vendorId: '$order.vendorId',
                    }
                }, {
                    $match: {
                        vendorId: vendorId,
                        customer: {
                            $regex: search, $options: 'i'
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
    getOrderSpecific: ({ orderId, userId, vendorId }) => {
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
                            'order.secretOrderId': orderId,
                            'order.vendorId': vendorId
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
                            vendorPayout: '$order.vendorPayout',
                            platformFeeTotal: '$order.platformFeeTotal',
                            platformPercentFee: '$order.platformPercentFee',
                            platformFixedFee: '$order.platformFixedFee',
                            settlementStatus: '$order.settlementStatus',
                            settlementDueAt: '$order.settlementDueAt',
                            settledAt: '$order.settledAt',
                            gstAmount: '$order.gstAmount',
                            shippingAmount: '$order.shippingAmount',
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
    updateOrderStatus: ({ userId, secretOrderId, vendorId, OrderStatus }) => {
        const allowed = new Set(['Pending', 'Processing', 'Shipped', 'In Transit', 'Out For Delivery', 'Delivered', 'Cancelled'])
        if (!allowed.has(OrderStatus)) {
            return Promise.reject(new Error('invalid_status'))
        }
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDERS).updateOne({
                _id: ObjectId(userId),
                'order.secretOrderId': secretOrderId,
                'order.vendorId': vendorId,
            }, {
                $set: {
                    'order.$.OrderStatus': OrderStatus,
                    'order.$.updated': `${new Date().getMonth() + 1}-${new Date().getDate()}-${new Date().getFullYear()}`,
                },
            }).then((result) => {
                if (result.matchedCount === 0) reject(new Error('not_found'))
                else resolve()
            }).catch(() => reject())
        })
    },
    updateUserDetails: (details) => {
        return new Promise(async (resolve, reject) => {
            const email = String(details.email || '').toLowerCase().trim()
            const vendorId = details.vendorId
            const setDoc = {
                number: String(details.number || ''),
                gstin: String(details.gstin || ''),
                panNumber: String(details.panNumber || '').toUpperCase(),
                locality: String(details.locality || ''),
                pinCode: String(details.pinCode || ''),
                address: String(details.address || ''),
                city: String(details.city || ''),
                state: String(details.state || ''),
                country: String(details.country || '')
            }

            let ownEmail = await db.get().collection(collections.VENDORS).findOne({
                _id: ObjectId(vendorId),
                email: email
            }).catch(() => {
                reject()
            })

            if (ownEmail) {
                db.get().collection(collections.VENDORS).updateOne({
                    _id: ObjectId(vendorId)
                }, {
                    $set: setDoc
                }).then(() => {
                    resolve({ email: false })
                }).catch(() => {
                    reject()
                })
            } else {
                let vendor = await db.get().collection(collections.VENDORS).findOne({
                    email: email
                }).catch(() => {
                    reject()
                })

                if (vendor) {
                    resolve({ email: true })
                } else {
                    db.get().collection(collections.VENDORS).updateOne({
                        _id: ObjectId(vendorId)
                    }, {
                        $set: {
                            email: email,
                            ...setDoc
                        }
                    }).then(() => {
                        resolve({ email: false })
                    }).catch(() => {
                        reject()
                    })
                }
            }
        })
    },
    updateBankAccount: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.VENDORS).updateOne({
                _id: ObjectId(details.vendorId)
            }, {
                $set: {
                    bankAccOwner: details.bankAccOwner,
                    bankName: details.bankName,
                    bankAccNumber: details.bankAccNumber,
                    bankIFSC: details.bankIFSC,
                    bankBranchName: details.bankBranchName,
                    bankBranchNumber: details.bankBranchNumber,
                }
            }).then(() => {
                resolve()
            }).catch(() => {
                reject()
            })
        })
    },
    getDashboardAnalytics: (vendorId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const products = await db.get().collection(collections.PRODUCTS).countDocuments({
                    vendor: true,
                    vendorId: vendorId
                })

                const rfqTotal = await db.get().collection(collections.RFQ).countDocuments({
                    vendorId: vendorId,
                    status: 'approved',
                })

                const rfqQuoted = await db.get().collection(collections.RFQ).countDocuments({
                    vendorId: vendorId,
                    status: 'approved',
                    quotedPrice: { $ne: null },
                })

                const rfqPending = Math.max(0, rfqTotal - rfqQuoted)

                const orderStatusRaw = await db.get().collection(collections.ORDERS).aggregate([
                    { $unwind: '$order' },
                    { $match: { 'order.vendorId': vendorId } },
                    {
                        $group: {
                            _id: '$order.OrderStatus',
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { count: -1 } }
                ]).toArray()

                const orderTotal = orderStatusRaw.reduce((sum, s) => sum + (s.count || 0), 0)
                const orderStatus = orderStatusRaw.map((s) => ({
                    status: s._id || 'Unknown',
                    count: s.count || 0
                }))

                const statusCount = (name) => orderStatus.find((s) => s.status === name)?.count || 0
                const processingStatuses = ['Processing', 'Shipped', 'In Transit', 'Out For Delivery']
                const ordersProcessing = processingStatuses.reduce((sum, st) => sum + statusCount(st), 0)

                const revenueAgg = await db.get().collection(collections.ORDERS).aggregate([
                    { $unwind: '$order' },
                    { $match: { 'order.vendorId': vendorId, 'order.OrderStatus': 'Delivered' } },
                    { $group: { _id: null, total: { $sum: '$order.price' } } },
                ]).toArray()
                const totalRevenue = revenueAgg[0]?.total || 0

                resolve({
                    products: products || 0,
                    rfqTotal: rfqTotal || 0,
                    rfqPending: rfqPending || 0,
                    rfqResponded: rfqQuoted || 0,
                    orderTotal,
                    orderStatus,
                    ordersPending: statusCount('Pending'),
                    ordersProcessing,
                    ordersDelivered: statusCount('Delivered'),
                    totalRevenue,
                })
            } catch (err) {
                reject(err)
            }
        })
    },
    getDashboardTotal: (vendorId) => {
        return new Promise(async (resolve, reject) => {
            let totalDelivered = await db.get().collection(collections.ORDERS).aggregate([
                {
                    $unwind: '$order'
                }, {
                    $match: {
                        'order.vendorId': vendorId,
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
                        'order.vendorId': vendorId,
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
                        'order.vendorId': vendorId,
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
                        'order.vendorId': vendorId,
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
    }
}
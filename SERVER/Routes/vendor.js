import express from "express";
import vendor from "../Helpers/vendor.js";
import getOTP from '../Helpers/getOTP.js';
import { sendVendorLoginOtp } from '../Helpers/sendAuthEmail.js'
import product from "../Helpers/product.js";
import rfqHelper from "../Helpers/rfq.js";
import vendorPlan from "../Helpers/vendorPlan.js";
import { getPlanAccess, getVerificationTagsForPlan, getPlanConfig, getPlanCatalogForClient } from "../Config/vendorPlans.js";
import db from "../Config/Connection.js";
import collections from "../Config/Collection.js";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import uploader from "../Helpers/uploader.js";
import slugify from 'slug-generator'
import deleteFile from '../Helpers/deleteFile.js'
import deleteFolder from "../Helpers/deleteFolder.js";
import trackProduct, { orderStatusControl } from "../ShipRocket/trackProduct.js";
import { notifyOrderStatusChanged, getOrderLineForNotify } from "../Helpers/orderNotifications.js";
import tokenShipRocket from "../ShipRocket/token.js";
import settlement from "../Helpers/settlement.js";
import vendorPickup from "../Helpers/vendorPickup.js";
import XLSX from "xlsx";

var router = express.Router()

/** Main product gallery (thumbnail + extras share the same "images" field; variant images use separate keys). */
const MAX_PRODUCT_IMAGES = 4
const VALID_PUBLISH_STATUS = new Set(['draft', 'published', 'archived'])
const COUNTRY_RULES = {
    India: {
        phoneMin: 10,
        phoneMax: 10,
        postalRegex: /^\d{6}$/
    },
    'United States': {
        phoneMin: 10,
        phoneMax: 10,
        postalRegex: /^\d{5}(-\d{4})?$/
    },
    'United Kingdom': {
        phoneMin: 10,
        phoneMax: 11,
        postalRegex: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i
    },
    UAE: {
        phoneMin: 9,
        phoneMax: 9,
        postalRegex: /^[A-Za-z0-9\- ]{3,12}$/
    },
    Singapore: {
        phoneMin: 8,
        phoneMax: 8,
        postalRegex: /^\d{6}$/
    }
}

function parseVendorCommerceFlags(body) {
    body.allowRfq = false
    body.allowCod = body.allowCod === 'false' || body.allowCod === false ? false : true
    body.allowOnline = body.allowOnline === 'false' || body.allowOnline === false ? false : true
    return body
}

function normalizeText(s) {
    return String(s ?? '').trim().replace(/\s+/g, ' ')
}

function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())
}

function CheckVendor(req, res, next) {
    const token = req.headers['x-access-token']
    try {
        let vendorTkn = jwt.verify(token, process.env.JWT_SECRET)

        vendor.getVendor(vendorTkn._id).then(async (data) => {
            if (data) {
                const current = await vendorPlan.ensurePlanCurrent(data).catch(() => data)
                if (!req.body || typeof req.body !== 'object') {
                    req.body = {}
                }
                req.body.vendorId = current._id.toString()
                req.query.vendorId = current._id.toString()
                next()
            } else {
                res.status(200).json({ login: true })
            }
        }).catch((err) => {
            res.status(500).json('err')
        })
    } catch (err) {
        res.status(200).json({ login: true })
    }
}

// Dashboard 

router.get('/getDashboard', CheckVendor, async (req, res) => {
    let total = await vendor.getDashboardTotal(req.body.vendorId).catch(() => {
        res.status(500).json('err')
    })

    let orders = await vendor.getAllOrders({ search: '', skip: 0, vendorId: req.body.vendorId }, 10).catch(() => {
        res.status(500).json('err')
    })

    let analytics = await vendor.getDashboardAnalytics(req.body.vendorId).catch(() => ({
        products: 0,
        rfqTotal: 0,
        rfqPending: 0,
        rfqResponded: 0,
        orderTotal: 0,
        orderStatus: []
    }))

    let planAccess = null
    try {
        let vendorDoc = await vendor.getVendor(req.body.vendorId)
        vendorDoc = await vendorPlan.ensurePlanCurrent(vendorDoc)
        const showcaseUsed = await vendorPlan.countShowcaseProducts(req.body.vendorId)
        planAccess = { ...vendorPlan.getPlanAccess(vendorDoc), showcaseUsed }
    } catch (_) { /* optional */ }

    let settlementSummary = null
    try {
        settlementSummary = await settlement.getVendorSettlementSummary(req.body.vendorId)
    } catch (_) { /* optional */ }

    res.status(200).json({
        total: total,
        Orders: orders,
        analytics: analytics,
        planAccess,
        settlementSummary,
        loaded: true
    })
})

// Account

router.post('/register', (req, res) => {
    const country = normalizeText(req.body.country || 'India')
    const countryRule = COUNTRY_RULES[country] || COUNTRY_RULES.India
    const phone = digitsOnly(req.body.number)
    const aadhaarOrId = normalizeText(req.body.adharNumber)
    const pinCode = normalizeText(req.body.pinCode).toUpperCase()
    const companyName = normalizeText(req.body.companyName)
    const adharName = normalizeText(req.body.adharName)
    const locality = normalizeText(req.body.locality)
    const address = normalizeText(req.body.address)
    const city = normalizeText(req.body.city)
    const state = normalizeText(req.body.state)
    const sellingElsewhere = normalizeText(req.body.sellingElsewhere || 'No')
    const sellingElsewhereDetail = normalizeText(req.body.sellingElsewhereDetail || '')
    const email = String(req.body.email || '').trim().toLowerCase()
    const gstin = normalizeText(req.body.gstin || '').toUpperCase()

    if (companyName.length < 3 || companyName.length > 120) {
        return res.status(400).json({ message: 'Invalid company name' })
    }
    if (!adharName || adharName.length < 3) {
        return res.status(400).json({ message: 'Invalid identity name' })
    }
    if (!validEmail(email)) {
        return res.status(400).json({ message: 'Invalid email' })
    }
    if (phone.length < countryRule.phoneMin || phone.length > countryRule.phoneMax) {
        return res.status(400).json({ message: 'Invalid phone number' })
    }
    if (country === 'India' && digitsOnly(aadhaarOrId).length !== 12) {
        return res.status(400).json({ message: 'Invalid Aadhaar number' })
    }
    if (country !== 'India' && !/^[A-Za-z0-9\- ]{6,20}$/.test(aadhaarOrId)) {
        return res.status(400).json({ message: 'Invalid national ID / tax ID' })
    }
    if (!locality || !address || !city || !state) {
        return res.status(400).json({ message: 'Address fields are required' })
    }
    if (!countryRule.postalRegex.test(pinCode)) {
        return res.status(400).json({ message: 'Invalid postal code' })
    }
    if (sellingElsewhere === 'Other' && sellingElsewhereDetail.length < 2) {
        return res.status(400).json({ message: 'Specify other platform details' })
    }
    if (gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i.test(gstin)) {
        return res.status(400).json({ message: 'Invalid GSTIN' })
    }

    req.body.companyName = companyName
    req.body.adharName = adharName
    req.body.adharNumber = country === 'India' ? digitsOnly(aadhaarOrId) : aadhaarOrId
    req.body.email = email
    req.body.number = phone
    req.body.gstin = gstin
    req.body.locality = locality
    req.body.address = address
    req.body.city = city
    req.body.state = state
    req.body.country = country
    req.body.sellingElsewhere = sellingElsewhere || 'No'
    req.body.sellingElsewhereDetail = sellingElsewhereDetail
    req.body.panNumber = ''
    req.body.bankAccOwner = ''
    req.body.bankName = ''
    req.body.bankAccNumber = ''
    req.body.bankIFSC = ''
    req.body.bankBranchName = ''
    req.body.bankBranchNumber = ''
    req.body.accept = false
    req.body.plan = null
    req.body.planStatus = 'none'
    req.body.planRequested = null
    req.body.planRequestedAt = null
    req.body.planActivatedAt = null
    req.body.planExpiresAt = null
    req.body.rfqQuotaUsed = 0
    req.body.rfqQuotaPeriodStart = null
    let date = new Date()
    req.body.date = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
    vendor.addVendor(req.body).then((data) => {
        res.status(200).json(data)
    }).catch(() => {
        res.status(500).json('err')
    })
})

router.post('/sentOtpLogin', (req, res) => {
    req.body.email = req.body.email.toLowerCase()
    vendor.checkVendorAccept(req.body.email).then((accept) => {
        if (accept) {
            vendor.checkOtp(req.body.email, 'login', 'vendor').then((oldOtp) => {
                if (oldOtp) {
                    sendVendorLoginOtp(req.body.email, oldOtp.otp).then((sent) => {
                        res.status(200).json({ mail: sent })
                    })
                } else {
                    getOTP((otp) => {
                        if (otp) {
                            vendor.insertOtp(req.body.email, otp, 'login', 'vendor').then(async () => {
                                const sent = await sendVendorLoginOtp(req.body.email, otp)
                                res.status(200).json({ mail: sent })
                            }).catch(() => {
                                res.status(500).json('err')
                            })
                        }
                    })
                }
            }).catch(() => {
                res.status(500).json('err')
            })
        } else {
            res.status(200).json({
                request: true
            })
        }
    }).catch(() => {
        res.status(500).json('err')
    })
})

router.post('/login', (req, res) => {
    req.body.email = req.body.email.toLowerCase()
    vendor.getVendorAccepted(req.body.email).then((vendorAccepted) => {
        if (vendorAccepted) {
            vendor.checkOtp(req.body.email, 'login', 'vendor').then((oldOtp) => {
                if (oldOtp) {
                    vendor.matchOtp(req.body, 'login', 'vendor').then((data) => {
                        if (data) {
                            const expire = 60 * 60 * 24

                            const token = jwt.sign({
                                email: vendorAccepted.email,
                                _id: vendorAccepted._id
                            }, process.env.JWT_SECRET, {
                                expiresIn: expire
                            })
                            res.status(200).json({
                                status: true,
                                token: token
                            })
                        } else {
                            res.status(200).json({
                                status: false
                            })
                        }
                    })
                } else {
                    getOTP((otp) => {
                        if (!otp) {
                            return res.status(500).json('err')
                        }
                        vendor.insertOtp(req.body.email, otp, 'login', 'vendor').then(async () => {
                            const sent = await sendVendorLoginOtp(req.body.email, otp)
                            res.status(200).json({ resent: true, mail: sent })
                        }).catch(() => {
                            res.status(500).json('err')
                        })
                    })
                }
            }).catch(() => {
                res.status(500).json('err')
            })
        } else {
            res.status(200).json({
                request: true
            })
        }
    }).catch(() => {
        res.status(500).json('err')
    })
})

router.get('/getVendorData', (req, res) => {
    let token = req.headers['x-access-token']
    try {
        let vendorTkn = jwt.verify(token, process.env.JWT_SECRET)
        vendor.getVendor(vendorTkn._id).then(async (vendorData) => {
            if (vendorData) {
                const refreshed = await vendorPlan.ensurePlanCurrent(vendorData).catch(() => vendorData)
                const showcaseUsed = await vendorPlan.countShowcaseProducts(refreshed._id.toString()).catch(() => 0)
                vendorData.status = true
                vendorData.planAccess = { ...vendorPlan.getPlanAccess(refreshed), showcaseUsed }
                res.status(200).json(vendorData)
            } else {
                res.status(200).json({
                    status: false
                })
            }
        }).catch(() => {
            res.status(500).json('err')
        })
    } catch (err) {
        res.status(200).json({
            status: false
        })
    }
})

router.put('/updateUserDetails', CheckVendor, (req, res) => {
    req.body.email = req.body.email.toLowerCase()
    req.body.number = String(req.body.number || '').replace(/\D/g, '').slice(0, 10)
    req.body.gstin = String(req.body.gstin || '').trim().toUpperCase()
    req.body.panNumber = String(req.body.panNumber || '').trim().toUpperCase()
    req.body.locality = String(req.body.locality || '').trim()
    req.body.address = String(req.body.address || '').trim()
    req.body.city = String(req.body.city || '').trim()
    req.body.state = String(req.body.state || '').trim()
    req.body.country = String(req.body.country || '').trim()
    req.body.pinCode = String(req.body.pinCode || '').trim().toUpperCase()

    if (!req.body.email || !req.body.number || req.body.number.length !== 10) {
        return res.status(400).json('invalid')
    }
    if (req.body.vendorIdCheck === req.body.vendorId) {
        vendor.updateUserDetails(req.body).then((data) => {
            res.status(200).json(data)
        }).catch(() => {
            res.status(500).json('err')
        })
    } else {
        res.status(500).json('err')
    }
})

router.put('/updateBankAccount', CheckVendor, (req, res) => {
    if (req.body.vendorIdCheck === req.body.vendorId) {
        vendor.updateBankAccount(req.body).then(() => {
            res.status(200).json('done')
        }).catch(() => {
            res.status(500).json("err")
        })
    } else {
        res.status(500).json("Err")
    }
})

// Product

router.get('/getCategories', (req, res) => {
    product.getCategories().then((categories) => {
        res.status(200).json(categories)
    }).catch(() => {
        res.status(500).json('err')
    })
})

router.post('/addProduct', CheckVendor, uploader.products.any(), (req, res, next) => {
    req.body.vendorId = req.query.vendorId
    req.body.vendor = true
    const allUploadedFiles = Array.isArray(req.files) ? req.files : []
    const productImages = allUploadedFiles.filter((f) => f.fieldname === 'images')
    const incomingStatus = VALID_PUBLISH_STATUS.has(req.body.publishStatus) ? req.body.publishStatus : 'draft'
    if (incomingStatus !== 'draft' && (productImages.length < 1 || productImages.length > MAX_PRODUCT_IMAGES)) {
        return res.status(400).json({ error: `Provide between 1 and ${MAX_PRODUCT_IMAGES} product images.` })
    }
    req.body.files = productImages

    req.body.variant = JSON.parse(req.body.variant)
    if (req.body.variant.length > 0) {
        req.body.variant = req.body.variant.map(v => {
            if (v.size === 'Other' && v.customSize) {
                v.size = v.customSize;
            }
            return v;
        });
        req.body.price = req.body.variant[0].price
        req.body.mrp = req.body.variant[0].mrp
        req.body.variantDetails = req.body.variant[0].details
        req.body.variant[0].active = true
        req.body.currVariantSize = req.body.variant[0].size
    } else {
        req.body.currVariantSize = ""
    }

    req.body.slug = slugify(req.body.name)

    const mrpParsed = Number.parseInt(req.body.mrp, 10)
    const priceParsed = Number.parseInt(req.body.price, 10)
    const safeMrp = Number.isFinite(mrpParsed) ? mrpParsed : 0
    const safePrice = Number.isFinite(priceParsed) ? priceParsed : 0
    const discount = Math.max(0, safeMrp - safePrice)
    const discountPerc = safeMrp > 0 ? Math.trunc((discount / safeMrp) * 100) : 0
    req.body.mrp = safeMrp
    req.body.price = safePrice
    req.body.discount = discountPerc
    parseVendorCommerceFlags(req.body)

    if (req.body.rfqTiers) {
        try {
            req.body.rfqTiers = JSON.parse(req.body.rfqTiers)
        } catch(e) {
            req.body.rfqTiers = []
        }
    } else {
        req.body.rfqTiers = []
    }

    if (req.body.rfqAttributes) {
        try {
            req.body.rfqAttributes = JSON.parse(req.body.rfqAttributes)
        } catch(e) {
            req.body.rfqAttributes = []
        }
    } else {
        req.body.rfqAttributes = []
    }

    req.body.rfqCustomization = req.body.rfqCustomization === 'true' || req.body.rfqCustomization === true
    req.body.rfqCustomizationDesc = req.body.rfqCustomizationDesc || ''
    req.body.rfqHandlingTime = req.body.rfqHandlingTime || ''
    req.body.rfqLeadTime = req.body.rfqLeadTime || ''
    req.body.publishStatus = VALID_PUBLISH_STATUS.has(req.body.publishStatus) ? req.body.publishStatus : 'draft'

    if (req.body.rfqPackaging) {
        try {
            req.body.rfqPackaging = JSON.parse(req.body.rfqPackaging)
        } catch (e) {
            req.body.rfqPackaging = {}
        }
    } else {
        req.body.rfqPackaging = {}
    }

    if (req.body.rfqCertificates) {
        try {
            req.body.rfqCertificates = JSON.parse(req.body.rfqCertificates)
        } catch (e) {
            req.body.rfqCertificates = []
        }
    } else {
        req.body.rfqCertificates = []
    }

    // ShipRocket shipment weight/dim (used for shipping estimate + label creation)
    const weightKg = parseFloat(req.body.weightKg)
    const lengthCm = parseFloat(req.body.lengthCm)
    const breadthCm = parseFloat(req.body.breadthCm)
    const heightCm = parseFloat(req.body.heightCm)
    req.body.weightKg = Number.isFinite(weightKg) ? weightKg : 2.5
    req.body.lengthCm = Number.isFinite(lengthCm) ? lengthCm : 10
    req.body.breadthCm = Number.isFinite(breadthCm) ? breadthCm : 15
    req.body.heightCm = Number.isFinite(heightCm) ? heightCm : 20
    req.body.isShowcase = req.body.isShowcase === 'true' || req.body.isShowcase === true

    vendor.getVendor(req.query.vendorId).then(async (vendorDoc) => {
        if (incomingStatus === 'published') {
            const planCheck = vendorPlan.assertCanPublish(vendorDoc)
            if (!planCheck.ok) {
                return res.status(403).json({ error: planCheck.message, code: planCheck.code })
            }
        }
        if (req.body.isShowcase && incomingStatus === 'published') {
            const showcaseCheck = await vendorPlan.assertShowcaseLimit(vendorDoc, req.query.vendorId, true)
            if (!showcaseCheck.ok) {
                return res.status(403).json({ error: showcaseCheck.message, code: 'SHOWCASE_LIMIT' })
            }
        }
        if (!req.body.isShowcase || incomingStatus !== 'published') {
            req.body.isShowcase = false
        }

        try {
            await vendorPickup.applyToProductBody(req.body, req.query.vendorId)
        } catch (e) {
            const msg = e.message === 'pickup_address_required'
                ? 'Select a pickup address for this product (Settings → Pickup addresses).'
                : (e.message === 'no_pickup_addresses'
                    ? 'Add a pickup address in Settings before publishing.'
                    : e.message)
            return res.status(400).json({ error: msg })
        }

        vendor.addProduct(req.body).then(async (done) => {
            if (req.body.isShowcase && incomingStatus === 'published') {
                await vendorPlan.syncShowcaseLock(req.query.vendorId, vendorDoc)
            }
            res.status(200).json(done)
        }).catch((err) => {
            res.status(500).json(err)
        })
    }).catch(() => res.status(500).json('err'))
})

router.get('/getProducts', CheckVendor, async (req, res, next) => {
    if (req.query.search === undefined) {
        let proCount = await vendor.getProductVendorCount(req.query.vendorId).catch((err) => {
            console.log(err)
        })

        var response = {
            data: [],
            pagination: false,
            totalPage: 1,
            currentPage: 1,
            pages: [],
            showNot: false,
            search: false
        }

        if (proCount === 0 || proCount === undefined || proCount === null) {
            response.showNot = true
        }

        var skip
        var limit = 12

        if (proCount > limit) {
            skip = 0
            response.totalPage = Math.ceil(proCount / limit)
            response.pagination = true
            var page = parseInt(req.query.page)
            if (page) {
                skip = (page - 1) * limit
                response.currentPage = page
                if (page + 2 <= response.totalPage) {
                    var max = page + 2
                    if (page === 1) {
                        for (var i = 0; i <= 2; i++) {
                            response.pages[i] = page + i
                        }
                    } else {
                        var oldPage = page - 1
                        for (var i = 0; i <= 3; i++) {
                            response.pages[i] = oldPage + i
                        }
                    }
                } else if (page + 1 <= response.totalPage) {
                    var max = page + 1
                    if (page === 1) {
                        for (var i = 0; i <= 1; i++) {
                            response.pages[i] = page + i
                        }
                    } else {
                        var oldPage = page - 1
                        for (var i = 0; i <= 2; i++) {
                            response.pages[i] = oldPage + i
                        }
                    }
                } else {
                    response.pages[0] = page - 1
                    response.pages[1] = page
                }
            }

        } else {
            skip = 0
            response.pagination = false
        }

        vendor.getVendorProducts(skip, limit, req.query.vendorId).then((data) => {
            response.data = data
            res.status(200).json(response)
        }).catch((err) => {
            res.status(500).json(err)
        })
    } else {
        let allProductCount = await vendor.getProductVendorCount(req.query.vendorId).catch((err) => {
            console.log(err)
        })

        let proCount = await vendor.getProductCountVendorSearch(req.query.search, req.query.vendorId).catch((err) => {
            console.log(err)
        })

        var response = {
            data: [],
            pagination: false,
            totalPage: 1,
            currentPage: 1,
            pages: [],
            search: true,
            showNot: false
        }

        if (allProductCount === 0 || allProductCount === undefined || allProductCount === null) {
            response.showNot = true
        }

        var skip
        var limit = 12

        if (proCount > limit) {
            skip = 0
            response.totalPage = Math.ceil(proCount / limit)
            response.pagination = true
            var page = parseInt(req.query.page)
            if (page) {
                skip = (page - 1) * limit
                response.currentPage = page
                if (page + 2 <= response.totalPage) {
                    var max = page + 2
                    if (page === 1) {
                        for (var i = 0; i <= 2; i++) {
                            response.pages[i] = page + i
                        }
                    } else {
                        var oldPage = page - 1
                        for (var i = 0; i <= 3; i++) {
                            response.pages[i] = oldPage + i
                        }
                    }
                } else if (page + 1 <= response.totalPage) {
                    var max = page + 1
                    if (page === 1) {
                        for (var i = 0; i <= 1; i++) {
                            response.pages[i] = page + i
                        }
                    } else {
                        var oldPage = page - 1
                        for (var i = 0; i <= 2; i++) {
                            response.pages[i] = oldPage + i
                        }
                    }
                } else {
                    response.pages[0] = page - 1
                    response.pages[1] = page
                }
            }

        } else {
            skip = 0
            response.pagination = false
        }

        vendor.getVendorProductsSearch(req.query.search, skip, limit, req.query.vendorId).then((data) => {
            response.data = data
            res.status(200).json(response)
        }).catch((err) => {
            res.status(500).json(err)
        })
    }
})

router.get('/exportProductsExcel', CheckVendor, async (req, res) => {
    try {
        const search = (req.query.search || '').trim()
        const rows = search
            ? await vendor.getVendorProductsSearch(search, 0, 10000, req.query.vendorId)
            : await vendor.getVendorProducts(0, 10000, req.query.vendorId)

        const data = (rows || []).map((p) => ({
            Name: p.name || '',
            Category: p.category || '',
            Status: p.publishStatus || 'published',
            Availability: p.available === 'true' ? 'Available' : 'Not Available',
            Type: p.allowRfq === true ? 'RFQ' : 'Regular',
            Price: p.price || 0,
            MRP: p.mrp || 0,
            DiscountPercent: p.discount || 0,
            CurrentVariant: p.currVariantSize || '',
            Cancellation: p.cancellation === 'true' ? 'Yes' : 'No',
            Return: p.return === 'true' ? 'Yes' : 'No'
        }))

        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Products')
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Content-Disposition', 'attachment; filename="vendor-products.xlsx"')
        res.status(200).send(buffer)
    } catch (err) {
        res.status(500).json('err')
    }
})

router.get('/getOneProduct/:prodId', CheckVendor, (req, res) => {
    if (req.params['prodId'].length === 24) {
        vendor.getOneProduct(req.body.vendorId, req.params.prodId).then((product) => {
            res.status(200).json(product)
        }).catch(() => {
            res.status(500).json('err')
        })
    } else {
        res.status(500).json('err')
    }
})

router.put('/editProduct/:id', CheckVendor, uploader.products.any(), (req, res) => {
    if (req.params['id'].length === 24) {
        var data = req.body

        data.variant = JSON.parse(data.variant)
        if (data.variant.length > 0) {
            data.variant = data.variant.map(v => {
                if (v.size === 'Other' && v.customSize) {
                    v.size = v.customSize;
                }
                return v;
            });
            data.price = data.variant[0].price
            data.mrp = data.variant[0].mrp
            data.variantDetails = data.variant[0].details
            data.variant[0].active = true
            data.currVariantSize = data.variant[0].size
        } else {
            data.currVariantSize = ""
        }

        data.slug = slugify(data.name)

        const mrpParsed2 = Number.parseInt(data.mrp, 10)
        const priceParsed2 = Number.parseInt(data.price, 10)
        const safeMrp2 = Number.isFinite(mrpParsed2) ? mrpParsed2 : 0
        const safePrice2 = Number.isFinite(priceParsed2) ? priceParsed2 : 0
        const discount2 = Math.max(0, safeMrp2 - safePrice2)
        const discountPerc2 = safeMrp2 > 0 ? Math.trunc((discount2 / safeMrp2) * 100) : 0
        data.mrp = safeMrp2
        data.price = safePrice2
        data.discount = discountPerc2
        parseVendorCommerceFlags(data)

        if (data.rfqTiers) {
            try {
                data.rfqTiers = JSON.parse(data.rfqTiers)
            } catch(e) {
                data.rfqTiers = []
            }
        } else {
            data.rfqTiers = []
        }

        if (data.rfqAttributes) {
            try {
                data.rfqAttributes = JSON.parse(data.rfqAttributes)
            } catch(e) {
                data.rfqAttributes = []
            }
        } else {
            data.rfqAttributes = []
        }

        data.rfqCustomization = data.rfqCustomization === 'true' || data.rfqCustomization === true
        data.rfqCustomizationDesc = data.rfqCustomizationDesc || ''
        data.rfqHandlingTime = data.rfqHandlingTime || ''
        data.rfqLeadTime = data.rfqLeadTime || ''
        data.publishStatus = VALID_PUBLISH_STATUS.has(data.publishStatus) ? data.publishStatus : 'draft'

        if (data.rfqPackaging) {
            try {
                data.rfqPackaging = JSON.parse(data.rfqPackaging)
            } catch (e) {
                data.rfqPackaging = {}
            }
        } else {
            data.rfqPackaging = {}
        }

        if (data.rfqCertificates) {
            try {
                data.rfqCertificates = JSON.parse(data.rfqCertificates)
            } catch (e) {
                data.rfqCertificates = []
            }
        } else {
            data.rfqCertificates = []
        }

        // ShipRocket shipment weight/dim (used for shipping estimate + label creation)
        const weightKg2 = parseFloat(data.weightKg)
        const lengthCm2 = parseFloat(data.lengthCm)
        const breadthCm2 = parseFloat(data.breadthCm)
        const heightCm2 = parseFloat(data.heightCm)
        data.weightKg = Number.isFinite(weightKg2) ? weightKg2 : 2.5
        data.lengthCm = Number.isFinite(lengthCm2) ? lengthCm2 : 10
        data.breadthCm = Number.isFinite(breadthCm2) ? breadthCm2 : 15
        data.heightCm = Number.isFinite(heightCm2) ? heightCm2 : 20
        data.isShowcase = data.isShowcase === 'true' || data.isShowcase === true

        var serverImg = JSON.parse(data.serverImg)
        if (!Array.isArray(serverImg) || serverImg.length > MAX_PRODUCT_IMAGES) {
            return res.status(400).json({ error: `Maximum ${MAX_PRODUCT_IMAGES} product images allowed.` })
        }
        data.serverImg = serverImg
        var delImgs = JSON.parse(data.deleteImg)

        serverImg.map(obj => {
            delImgs = delImgs.filter(obj2 => {
                if (obj.filename === obj2) {
                    return false
                } else {
                    return true
                }
            })
        })

        vendor.getVendor(req.query.vendorId).then(async (vendorDoc) => {
            const existingProduct = await db.get().collection(collections.PRODUCTS).findOne({
                _id: new ObjectId(req.params.id),
                vendorId: String(req.query.vendorId),
            }).catch(() => null)
            const wasShowcase = !!existingProduct?.isShowcase

            if (data.publishStatus === 'published') {
                const planCheck = vendorPlan.assertCanPublish(vendorDoc)
                if (!planCheck.ok) {
                    return res.status(403).json({ error: planCheck.message, code: planCheck.code })
                }
            }

            const lockCheck = await vendorPlan.assertShowcaseChange(
                vendorDoc,
                req.query.vendorId,
                req.params.id,
                wasShowcase,
                data.isShowcase
            )
            if (!lockCheck.ok) {
                return res.status(403).json({ error: lockCheck.message, code: lockCheck.code })
            }

            if (data.isShowcase && data.publishStatus === 'published') {
                const showcaseCheck = await vendorPlan.assertShowcaseLimit(
                    vendorDoc,
                    req.query.vendorId,
                    true,
                    req.params.id
                )
                if (!showcaseCheck.ok) {
                    return res.status(403).json({ error: showcaseCheck.message, code: 'SHOWCASE_LIMIT' })
                }
            }
            if (!data.isShowcase || data.publishStatus !== 'published') {
                data.isShowcase = false
            }

            if (!data.pickupAddressId && existingProduct?.pickupAddressId) {
                data.pickupAddressId = existingProduct.pickupAddressId
            }
            try {
                await vendorPickup.applyToProductBody(data, req.query.vendorId)
            } catch (e) {
                const msg = e.message === 'pickup_address_required'
                    ? 'Select a pickup address for this product (Settings → Pickup addresses).'
                    : (e.message === 'no_pickup_addresses'
                        ? 'Add a pickup address in Settings before publishing.'
                        : e.message)
                return res.status(400).json({ error: msg })
            }

            vendor.updateProduct(data, req.query.vendorId).then(async (succ) => {
                await vendorPlan.syncShowcaseLock(req.query.vendorId, vendorDoc)
                if (delImgs.length !== 0) {
                    deleteFile(serverImg[0].destination + '/', delImgs, (done) => {
                        if (done) {
                            res.status(200).json(succ)
                        }
                    })
                } else {
                    res.status(200).json(succ)
                }
            }).catch(() => {
                res.status(500).json('err')
            })
        }).catch(() => res.status(500).json('err'))
    } else {
        res.status(500).json('err')
    }
})

router.delete('/deleteProduct', CheckVendor, (req, res) => {
    var dir = `./uploads/product/${req.body.folderId}`
    if (req.body['proId'].length === 24) {
        vendor.deleteProduct(req.body).then(() => {
            deleteFolder(dir, (data) => {
                if (data) {
                    res.status(200).json("done")
                } else {
                    res.status(200).json("done")
                }
            })
        }).catch(() => {
            res.status(500).json('err')
        })
    } else {
        res.status(500).json('err')
    }
})

// Order 

router.get('/getAllOrders', CheckVendor, async (req, res) => {
    let total = await vendor.getTotalOrders(req.query).catch(() => {
        res.status(500).json('err')
    })

    let orders = await vendor.getAllOrders(req.query, 10).catch(() => {
        res.status(500).json('err')
    })

    if (Array.isArray(orders)) {
        res.status(200).json({
            total: total,
            orders: orders
        })
    }
})

router.get('/getOrderSpecific', CheckVendor, async (req, res) => {
    let token = null;
    const shiprocketConfigured = Boolean(
        process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASS
    )

    if (shiprocketConfigured) {
        token = await tokenShipRocket().catch(() => null);
    }

    let order_current = await vendor.getOrderSpecific(req.query).catch(() => {
        res.status(500).json('err')
    })

    if (!order_current) return

    let track

    if (order_current && token && order_current.shipment_id) {
        track = await trackProduct(order_current.shipment_id, token).catch(() => {
            console.log('error track')
        })
    }

    let order = await orderStatusControl(track, order_current).catch(() => {
        res.status(500).json('err')
    })

    res.status(200).json(order)
})

router.put('/updateOrderStatus', CheckVendor, async (req, res) => {
    const { userId, secretOrderId, OrderStatus } = req.body
    if (!userId || userId.length !== 24 || !secretOrderId || !OrderStatus) {
        return res.status(400).json('err')
    }
    try {
        await vendor.updateOrderStatus({
            userId,
            secretOrderId,
            vendorId: req.body.vendorId,
            OrderStatus,
        })
        const orderLine = await getOrderLineForNotify(userId, secretOrderId)
        await notifyOrderStatusChanged({
            userId,
            secretOrderId,
            newStatus: OrderStatus,
            orderLine,
        })
        res.status(200).json({ status: true, OrderStatus })
    } catch {
        res.status(500).json('err')
    }
})

// RFQ (vendor quotes are private to admin)
router.get('/getMyRfqs', CheckVendor, async (req, res) => {
    const search = req.query.search || '';
    const status = req.query.status || 'all';
    const skip = req.query.skip || 0;

    try {
        let vendorDoc = await vendor.getVendor(req.query.vendorId)
        vendorDoc = await vendorPlan.refreshQuotaIfNeeded(vendorDoc)
        const planAccess = getPlanAccess(vendorDoc)

        const result = await rfqHelper.getVendorRfqs({
            vendorId: req.query.vendorId,
            search,
            status,
            skip,
            rfqVisibilityLimit: planAccess.rfqQuotaLimit,
        }, 10)

        res.status(200).json({
            ...result,
            planAccess: {
                rfqQuotaLimit: planAccess.rfqQuotaLimit,
                rfqQuotaUsed: planAccess.rfqQuotaUsed,
                rfqQuotaRemaining: planAccess.rfqQuotaRemaining,
                planLabel: planAccess.planLabel,
            },
        })
    } catch {
        res.status(500).json('err')
    }
})

router.put('/quoteRfq', CheckVendor, async (req, res) => {
    const { rfqId, quotedPrice } = req.body
    if (!rfqId || rfqId.length !== 24) return res.status(400).json('err')

    try {
        let vendorDoc = await vendor.getVendor(req.body.vendorId)
        vendorDoc = await vendorPlan.refreshQuotaIfNeeded(vendorDoc)
        const planCheck = vendorPlan.assertCanQuoteRfq(vendorDoc)
        if (!planCheck.ok) {
            return res.status(403).json({ error: planCheck.message, code: planCheck.code })
        }

        const rfqDoc = await db.get().collection(collections.RFQ).findOne({
            _id: ObjectId(rfqId),
            vendorId: req.body.vendorId,
            status: 'approved',
        })
        const isNewQuote = rfqDoc && (rfqDoc.quotedPrice === undefined || rfqDoc.quotedPrice === null)

        await rfqHelper.updateVendorQuotedPrice({
            rfqId,
            quotedPrice,
            vendorId: req.body.vendorId
        })
        if (isNewQuote) {
            await vendorPlan.incrementRfqQuota(req.body.vendorId)
        }
        res.status(200).json('done')
    } catch {
        res.status(500).json('err')
    }
})

router.get('/getPlanAccess', CheckVendor, async (req, res) => {
    try {
        let vendorDoc = await vendor.getVendor(req.body.vendorId)
        vendorDoc = await vendorPlan.ensurePlanCurrent(vendorDoc)
        const showcaseUsed = await vendorPlan.countShowcaseProducts(req.body.vendorId)
        const access = vendorPlan.getPlanAccess(vendorDoc)
        res.status(200).json({ ...access, showcaseUsed })
    } catch {
        res.status(500).json('err')
    }
})

router.get('/planCatalog', (req, res) => {
    res.status(200).json({ plans: getPlanCatalogForClient() })
})

// Vendor Profile Management
router.get('/getProfile', CheckVendor, (req, res) => {
    vendor.getVendor(req.body.vendorId).then((vendorData) => {
        if (vendorData) {
            res.status(200).json(vendorData)
        } else {
            res.status(200).json({ status: false })
        }
    }).catch(() => {
        res.status(500).json('err')
    })
})

function safeJsonArray(str, fallback = []) {
    try {
        const x = JSON.parse(str || '[]')
        return Array.isArray(x) ? x : fallback
    } catch {
        return fallback
    }
}

const MAX_VENDOR_STORE_CERTIFICATES = 5

router.get('/pickupAddresses', CheckVendor, async (req, res) => {
    try {
        const list = await vendorPickup.getAddresses(req.query.vendorId)
        res.json(list)
    } catch {
        res.status(500).json({ error: 'err' })
    }
})

router.post('/pickupAddresses', CheckVendor, async (req, res) => {
    try {
        const addr = await vendorPickup.addAddress(req.query.vendorId, req.body)
        res.status(201).json(addr)
    } catch (e) {
        if (e.message === 'invalid_pickup_address') {
            return res.status(400).json({ error: 'Fill label, address, city, state and PIN code.' })
        }
        res.status(500).json({ error: e.message })
    }
})

router.put('/pickupAddresses/:id', CheckVendor, async (req, res) => {
    try {
        const addr = await vendorPickup.updateAddress(req.query.vendorId, req.params.id, req.body)
        res.json(addr)
    } catch (e) {
        if (e.message === 'address_not_found') return res.status(404).json({ error: 'Address not found' })
        res.status(500).json({ error: e.message })
    }
})

router.delete('/pickupAddresses/:id', CheckVendor, async (req, res) => {
    try {
        const list = await vendorPickup.deleteAddress(req.query.vendorId, req.params.id)
        res.json(list)
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

router.put('/updateProfile', CheckVendor, uploader.vendorProfile.fields([
    { name: 'images', maxCount: 1 },
    { name: 'logo', maxCount: 1 },
    { name: 'certificates', maxCount: MAX_VENDOR_STORE_CERTIFICATES }
]), (req, res) => {
    try {
        const vid = req.body.vendorId
        const existingCerts = safeJsonArray(req.body.existingCertificates, []).slice(0, MAX_VENDOR_STORE_CERTIFICATES)
        let newCertPaths = []
        if (req.files && req.files.certificates && req.files.certificates.length > 0) {
            newCertPaths = req.files.certificates.map((f) => `/uploads/vendor/${vid}/${f.filename}`)
        }
        const certificateImages = [...existingCerts, ...newCertPaths].slice(0, MAX_VENDOR_STORE_CERTIFICATES)

        const profileData = {
            website: req.body.website || '',
            description: req.body.description || '',
            companyInfo: req.body.companyInfo || '',
            socialLinks: (() => {
                try {
                    return req.body.socialLinks ? JSON.parse(req.body.socialLinks) : {}
                } catch {
                    return {}
                }
            })(),
            companyIntroduction: req.body.companyIntroduction || '',
            businessType: req.body.businessType || '',
            yearsInIndustry: req.body.yearsInIndustry || '',
            cooperatedSuppliers: req.body.cooperatedSuppliers || '',
            countryRegion: req.body.countryRegion || '',
            mainCategories: req.body.mainCategories || '',
            mainMarkets: safeJsonArray(req.body.mainMarkets, []),
            yearEstablished: req.body.yearEstablished || '',
            employeesRange: req.body.employeesRange || '',
            factorySizeRange: req.body.factorySizeRange || '',
            annualOutputRange: req.body.annualOutputRange || '',
            companyHighlights: safeJsonArray(req.body.companyHighlights, []),
            certificateImages,
            designCustomization: req.body.designCustomization === 'true' || req.body.designCustomization === true,
            fullCustomization: req.body.fullCustomization === 'true' || req.body.fullCustomization === true,
            annualRevenueNote: req.body.annualRevenueNote || '',
            exhibitionsNote: req.body.exhibitionsNote || ''
        }

        if (req.files && req.files.images && req.files.images[0]) {
            profileData.backgroundImage = `/uploads/vendor/${vid}/${req.files.images[0].filename}`
        }

        if (req.files && req.files.logo && req.files.logo[0]) {
            profileData.logo = `/uploads/vendor/${vid}/${req.files.logo[0].filename}`
        } else if (req.body.logo) {
            profileData.logo = req.body.logo
        }

        vendor.getVendor(vid).then((vendorDoc) => {
            const planKey = vendorDoc?.plan
            const config = getPlanConfig(planKey)
            profileData.verificationTags = getVerificationTagsForPlan(config)

            return vendor.updateVendorProfile(vid, profileData)
        }).then(() => {
            res.status(200).json({ success: true })
        }).catch(() => {
            res.status(500).json('err')
        })
    } catch (error) {
        console.error('Error updating profile:', error)
        res.status(500).json('err')
    }
})

// Public vendor profile endpoint
router.get('/public/:vendorId', async (req, res) => {
    if (req.params['vendorId'].length === 24) {
        try {
            let vendorData = await vendor.getVendorById(req.params.vendorId)
            if (vendorData) {
                vendorData = await vendorPlan.ensurePlanCurrent(vendorData).catch(() => vendorData)
                const planAccess = getPlanAccess(vendorData)
                const verificationTags = planAccess.verifiedBadge
                    ? getVerificationTagsForPlan(getPlanConfig(vendorData.plan))
                    : []

                const publicProfile = {
                    _id: vendorData._id,
                    name: vendorData.name,
                    displayName: vendorData.companyInfo || vendorData.companyName || vendorData.name,
                    website: vendorData.website || '',
                    description: vendorData.description || '',
                    backgroundImage: vendorData.backgroundImage || '',
                    logo: vendorData.logo || '',
                    businessType: vendorData.businessType || '',
                    yearsInIndustry: vendorData.yearsInIndustry || '',
                    cooperatedSuppliers: vendorData.cooperatedSuppliers || '',
                    countryRegion: vendorData.countryRegion || '',
                    mainCategories: vendorData.mainCategories || '',
                    socialLinks: vendorData.socialLinks || {},
                    designCustomization: vendorData.designCustomization === true,
                    fullCustomization: vendorData.fullCustomization === true,
                    verificationTags,
                    showCompanyProfile: planAccess.showCompanyProfile,
                    verifiedVendorBadge: planAccess.verifiedBadge,
                    planLabel: planAccess.planLabel,
                    plan: planAccess.plan,
                    canLinkStorefront: planAccess.canLinkStorefront,
                    supplierRating: planAccess.supplierRating,
                    status: true,
                }

                if (planAccess.showCompanyProfile) {
                    Object.assign(publicProfile, {
                        companyIntroduction: vendorData.companyIntroduction || '',
                        mainMarkets: vendorData.mainMarkets || [],
                        yearEstablished: vendorData.yearEstablished || '',
                        employeesRange: vendorData.employeesRange || '',
                        factorySizeRange: vendorData.factorySizeRange || '',
                        annualOutputRange: vendorData.annualOutputRange || '',
                        companyHighlights: vendorData.companyHighlights || [],
                        certificateImages: (vendorData.certificateImages || []).slice(0, MAX_VENDOR_STORE_CERTIFICATES),
                        annualRevenueNote: vendorData.annualRevenueNote || '',
                        exhibitionsNote: vendorData.exhibitionsNote || '',
                    })
                }

                res.status(200).json(publicProfile)
            } else {
                res.status(200).json({ status: false })
            }
        } catch {
            res.status(500).json('err')
        }
    } else {
        res.status(500).json('err')
    }
})

router.get('/public/:vendorId/products', (req, res) => {
    const id = req.params.vendorId
    if (!id || id.length !== 24) {
        return res.status(400).json({ status: false })
    }
    const limit = Math.min(parseInt(req.query.limit, 10) || 12, 48)
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1)
    const skip = (page - 1) * limit
    const search = (req.query.search || '').toString()

    vendor.getVendorById(id).then((vendorData) => {
        const planAccess = vendorData ? getPlanAccess(vendorData) : { verifiedBadge: false }

        return vendor.getPublicVendorProductCount(id, search).then((total) => {
            return vendor.getPublicVendorProducts(id, skip, limit, search).then((data) => {
                const products = (data || []).map((p) => ({
                    ...p,
                    verifiedVendorBadge: planAccess.verifiedBadge,
                }))
                res.status(200).json({
                    status: true,
                    data: products,
                    page,
                    limit,
                    total,
                    totalPages: Math.max(1, Math.ceil(total / limit)),
                    verifiedVendorBadge: planAccess.verifiedBadge,
                })
            })
        })
    }).catch(() => {
        res.status(500).json('err')
    })
})

export default router
import multer from 'multer'
import { createUploadStorage } from './storageFactory.js'

const productsStorage = createUploadStorage({
    diskDestination(req) {
        return `./uploads/product/${req.body.uni_id_1}${req.body.uni_id_2}`
    },
    diskFilename(req, file) {
        return req.body.uni_id_1 + file.originalname
    },
    s3KeyBuilder(req, file) {
        const folder = `${req.body.uni_id_1}${req.body.uni_id_2}`
        return {
            key: `product/${folder}/${req.body.uni_id_1}${file.originalname}`,
            filename: req.body.uni_id_1 + file.originalname,
        }
    },
})

function safeCategoryFilename(originalname) {
    const base = String(originalname || 'image.jpg').replace(/[^a-zA-Z0-9._-]/g, '_')
    return `${Date.now()}-${base}`
}

const categoryStorage = createUploadStorage({
    diskDestination(req) {
        const id1 = req.body?.uni_id1 || 'cat'
        const id2 = req.body?.uni_id2 || Date.now()
        return `./uploads/category/${id1}${id2}`
    },
    diskFilename(req, file) {
        return safeCategoryFilename(file.originalname)
    },
    s3KeyBuilder(req, file) {
        const id1 = req.body?.uni_id1 || 'cat'
        const id2 = req.body?.uni_id2 || Date.now()
        const folder = `${id1}${id2}`
        const filename = safeCategoryFilename(file.originalname)
        return {
            key: `category/${folder}/${filename}`,
            filename,
        }
    },
})

const extraStorage = createUploadStorage({
    diskDestination(req) {
        return `./uploads/${req.body.for}/${req.body.uni_id}`
    },
    diskFilename(req, file) {
        return file.originalname
    },
    s3KeyBuilder(req, file) {
        return `${req.body.for}/${req.body.uni_id}/${file.originalname}`
    },
})

const bannerStorage = createUploadStorage({
    diskDestination() {
        return './uploads/banner'
    },
    diskFilename(req, file) {
        return `${req.body.uni_id}${file.originalname}`
    },
    s3KeyBuilder(req, file) {
        return `banner/${req.body.uni_id}${file.originalname}`
    },
})

const userProfileStorage = createUploadStorage({
    diskDestination(req) {
        return `./uploads/user/${req.userId || req.body.userId}`
    },
    diskFilename(req, file) {
        return Date.now() + file.originalname
    },
    s3KeyBuilder(req, file) {
        const uid = req.userId || req.body.userId
        const name = Date.now() + file.originalname
        return `user/${uid}/${name}`
    },
})

const vendorProfileStorage = createUploadStorage({
    diskDestination(req) {
        const raw = (req.body.vendorId || 'temp').toString()
        const vid = raw.replace(/[^a-f0-9]/gi, '')
        const safe = vid.length === 24 ? vid : 'temp'
        return `./uploads/vendor/${safe}`
    },
    diskFilename(req, file) {
        let prefix = 'banner'
        if (file.fieldname === 'certificates') prefix = 'cert'
        else if (file.fieldname === 'logo') prefix = 'logo'
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
        return `${prefix}-${Date.now()}-${safeName}`
    },
    s3KeyBuilder(req, file) {
        const raw = (req.body.vendorId || 'temp').toString()
        const vid = raw.replace(/[^a-f0-9]/gi, '')
        const safe = vid.length === 24 ? vid : 'temp'
        let prefix = 'banner'
        if (file.fieldname === 'certificates') prefix = 'cert'
        else if (file.fieldname === 'logo') prefix = 'logo'
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
        const filename = `${prefix}-${Date.now()}-${safeName}`
        return {
            key: `uploads/vendor/${safe}/${filename}`,
            filename,
        }
    },
})

export default {
    products: multer({ storage: productsStorage }),
    categories: multer({
        storage: categoryStorage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter(req, file, cb) {
            const ok = /^image\/(jpeg|jpg|png|gif|webp)$/i.test(file.mimetype)
            cb(ok ? null : new Error('Only JPG, PNG, GIF or WebP images are allowed.'), ok)
        },
    }),
    extra: multer({ storage: extraStorage }),
    banner: multer({ storage: bannerStorage }),
    userProfile: multer({
        storage: userProfileStorage,
        limits: { fileSize: 2 * 1024 * 1024 },
        fileFilter(req, file, cb) {
            const ok = /^image\/(jpeg|jpg|png|gif)$/i.test(file.mimetype)
            cb(ok ? null : new Error('invalid_image_type'), ok)
        },
    }),
    vendorProfile: multer({ storage: vendorProfileStorage }),
}

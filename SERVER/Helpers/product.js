import db from '../Config/Connection.js'
import collections from '../Config/Collection.js'
import { ObjectId } from 'mongodb'

export default {
    getOneProduct: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCTS).findOne({
                _id: ObjectId(proId)
            }).then((product) => {
                resolve(product)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    getCategories: () => {
        return new Promise(async (resolve, reject) => {
            let categories = await db.get().collection(collections.CATEGORIES).find().toArray().catch((err) => {
                reject(err)
            })

            resolve(categories)
        })
    },
    getShopCategories: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const categories = await db.get().collection(collections.CATEGORIES).find().toArray()
                const result = []

                for (const cat of categories) {
                    const slugs = new Set([cat.slug])
                    for (const m of cat.mainSub || []) {
                        if (m.slug) slugs.add(m.slug)
                    }
                    for (const s of cat.sub || []) {
                        if (s.slug) slugs.add(s.slug)
                    }

                    const stats = await db.get().collection(collections.PRODUCTS).aggregate([
                        {
                            $match: {
                                publishStatus: 'published',
                                available: 'true',
                                allowRfq: { $ne: true },
                                categorySlug: { $in: [...slugs] },
                                price: { $gt: 0 },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                minPrice: { $min: '$price' },
                                productCount: { $sum: 1 },
                            },
                        },
                    ]).toArray()

                    const minPrice = stats[0]?.minPrice ?? null
                    const productCount = stats[0]?.productCount ?? 0

                    result.push({
                        _id: cat._id,
                        name: cat.name,
                        slug: cat.slug,
                        uni_id1: cat.uni_id1,
                        uni_id2: cat.uni_id2,
                        file: cat.file,
                        minPrice,
                        productCount,
                    })
                }

                result.sort((a, b) => (b.productCount || 0) - (a.productCount || 0))
                resolve(result)
            } catch (err) {
                reject(err)
            }
        })
    },
    searchCategory: (search) => {
        return new Promise(async (resolve, reject) => {
            let categories = await db.get().collection(collections.CATEGORIES).find({
                name: { $regex: search, $options: "i" }
            }).limit(10).toArray().catch((err) => {
                reject(err)
            })
            resolve(categories)
        })
    },
    getMainSubCategories: () => {
        return new Promise(async (resolve, reject) => {
            let mainSub = await db.get().collection(collections.CATEGORIES).aggregate([
                {
                    $unwind: "$mainSub"
                }, {
                    $project: {
                        _id: '$_id',
                        name: '$mainSub.name',
                        category: '$mainSub.category',
                        uni_id: '$mainSub.uni_id',
                        slug: '$mainSub.slug'
                    }
                }
            ]).toArray().catch((err) => {
                reject(err)
            })

            resolve(mainSub)
        })
    },
    searchMainSubCategory: (search) => {
        return new Promise(async (resolve, reject) => {
            let result = await db.get().collection(collections.CATEGORIES).aggregate([
                {
                    $unwind: '$mainSub'
                }, {
                    $project: {
                        _id: '$_id',
                        name: '$mainSub.name',
                        uni_id: '$mainSub.uni_id',
                        slug: '$mainSub.slug',
                        category: "$mainSub.category"
                    }
                }, {
                    $match: {
                        name: { $regex: search, $options: 'i' }
                    }
                }
            ]).toArray().catch((err) => {
                reject(err)
            })

            resolve(result)
        })
    },
    getSubCategories: () => {
        return new Promise(async (resolve, reject) => {
            let subCategory = await db.get().collection(collections.CATEGORIES).aggregate([
                {
                    $unwind: "$sub"
                }, {
                    $project: {
                        _id: '$_id',
                        uni_id: "$sub.uni_id",
                        slug: "$sub.slug",
                        name: "$sub.name",
                        mainSubSlug: "$sub.mainSubSlug",
                        mainSub: "$sub.mainSub",
                        category: "$sub.category"
                    }
                }, {
                    $sort: {
                        mainSub: 1
                    }
                }
            ]).toArray().catch((err) => {
                reject(err)
            })

            resolve(subCategory)
        })
    },
    getOneCategory: (cateId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CATEGORIES).findOne({
                _id: ObjectId(cateId)
            }).then((category) => {
                resolve(category)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    getOneUserProduct: (proSlug, proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCTS).findOne({
                _id: ObjectId(proId),
                slug: proSlug
            }).then((product) => {
                resolve(product)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    getSimilarProduct: (cateSlug) => {
        return new Promise(async (resolve, reject) => {
            let similar = await db.get().collection(collections.PRODUCTS).find({
                categorySlug: cateSlug
            }).limit(8).toArray().catch((err) => {
                reject(err)
            })

            resolve(similar)
        })
    },
    getCategoryProduct: (details, skip, limit) => {
        var sort = details.sort
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collections.PRODUCTS).find({
                categorySlug: { $regex: details.category, $options: 'i' },
                price: {
                    $gte: details.min,
                    $lte: details.max
                }
            }).sort(sort).skip(skip).limit(limit).toArray().catch((err) => {
                reject(err)
            })

            resolve(products)
        })
    },
    getCategoryProductCount: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCTS).countDocuments({
                categorySlug: { $regex: details.category, $options: 'i' },
                price: {
                    $gte: details.min,
                    $lte: details.max
                }
            }).then((data) => {
                resolve(data)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    getSearchProductCount: (details) => {
        return new Promise((resolve, reject) => {
            let query = {
                price: {
                    $gte: details.min,
                    $lte: details.max
                }
            }

            if (details.search) {
                query.$or = [
                    { name: { $regex: details.search, $options: 'i' } },
                    { category: { $regex: details.search, $options: 'i' } },
                    { categorySlug: { $regex: details.search, $options: 'i' } },
                    { seoKeyword: { $regex: details.search, $options: 'i' } }
                ]
            }

            if (details.category) {
                query.categorySlug = { $regex: details.category, $options: 'i' }
            }

            db.get().collection(collections.PRODUCTS).countDocuments(query).then((data) => {
                resolve(data)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    getSearchProduct: (details, skip, limit) => {
        var sort = details.sort
        return new Promise(async (resolve, reject) => {
            let query = {
                price: {
                    $gte: details.min,
                    $lte: details.max
                }
            }

            if (details.search) {
                query.$or = [
                    { name: { $regex: details.search, $options: 'i' } },
                    { category: { $regex: details.search, $options: 'i' } },
                    { categorySlug: { $regex: details.search, $options: 'i' } },
                    { seoKeyword: { $regex: details.search, $options: 'i' } }
                ]
            }

            if (details.category) {
                query.categorySlug = { $regex: details.category, $options: 'i' }
            }

            let products = await db.get().collection(collections.PRODUCTS).find(query)
                .sort(sort).skip(skip).limit(limit).toArray().catch((err) => {
                    reject(err)
                })

            resolve(products)
        })
    },
    getHeaderCategories: () => {
        return new Promise(async (resolve, reject) => {
            let categories = await db.get().collection(collections.CATEGORIES).find({
                header: "true"
            }).toArray().catch((err) => {
                reject(err)
            })

            resolve(categories)
        })
    },
    searchProductSimple: (search) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collections.PRODUCTS).find({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { category: { $regex: search, $options: 'i' } },
                    { categorySlug: { $regex: search, $options: 'i' } },
                    { seoKeyword: { $regex: search, $options: 'i' } }
                ]
            }).limit(12).toArray().catch((err) => {
                reject(err)
            })

            resolve(products)
        })
    },
    findCupon: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CUPONS).findOne({
                code: details
            }).then((data) => {
                if (data) {
                    resolve(data)
                } else {
                    reject()
                }
            }).catch(() => {
                reject()
            })
        })
    },
    addReview: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.REVIEWS).insertOne(details).then(() => {
                resolve()
            }).catch(() => {
                reject()
            })
        })
    },
    getAllReviews: (proId, skip, limit) => {
        return new Promise(async (resolve, reject) => {
            let reviews = db.get().collection(collections.REVIEWS).find({
                proId: proId
            }).sort({ _id: -1 }).skip(skip).limit(limit).toArray().catch(() => {
                reject()
            })

            resolve(reviews)
        })
    },
    getUserReview: ({ userId, proId }) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.REVIEWS).findOne({
                userId: userId,
                proId: proId
            }).then((review) => {
                if (review) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            }).catch(() => {
                reject()
            })
        })
    },
    getTotalReviewCount: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.REVIEWS).countDocuments({
                proId: proId
            }).then((count) => {
                resolve(count)
            }).catch(() => {
                reject()
            })
        })
    },
    deleteReview: ({ userId, proId }) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.REVIEWS).deleteOne({
                userId: userId,
                proId: proId
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
    getStarsRatingReviews: (proId) => {
        return new Promise(async (resolve, reject) => {

            let stars = await db.get().collection(collections.REVIEWS).aggregate([
                {
                    $match: {
                        proId: proId
                    }
                }, {
                    $project: {
                        one: {
                            $cond: {
                                if: {
                                    $eq: ['$stars', 'one']
                                }, then: 1, else: 0
                            }
                        },
                        two: {
                            $cond: {
                                if: {
                                    $eq: ['$stars', 'two']
                                }, then: 1, else: 0
                            }
                        },
                        three: {
                            $cond: {
                                if: {
                                    $eq: ['$stars', 'three']
                                }, then: 1, else: 0
                            }
                        },
                        four: {
                            $cond: {
                                if: {
                                    $eq: ['$stars', 'four']
                                }, then: 1, else: 0
                            }
                        },
                        five: {
                            $cond: {
                                if: {
                                    $eq: ['$stars', 'five']
                                }, then: 1, else: 0
                            }
                        },
                    }
                }, {
                    $group: {
                        _id: proId,
                        count: {
                            $sum: 1
                        },
                        one: {
                            $sum: '$one'
                        },
                        two: {
                            $sum: '$two'
                        },
                        three: {
                            $sum: '$three'
                        },
                        four: {
                            $sum: '$four'
                        },
                        five: {
                            $sum: '$five'
                        }
                    }
                }, {
                    $project: {
                        _id: proId,
                        one: 1,
                        two: 1,
                        three: 1,
                        four: 1,
                        five: 1,
                        onePerc: {
                            $multiply: [{
                                $divide: ['$one', '$count']
                            }, 100]
                        },
                        twoPerc: {
                            $multiply: [{
                                $divide: ['$two', '$count']
                            }, 100]
                        },
                        threePerc: {
                            $multiply: [{
                                $divide: ['$three', '$count']
                            }, 100]
                        },
                        fourPerc: {
                            $multiply: [{
                                $divide: ['$four', '$count']
                            }, 100]
                        },
                        fivePerc: {
                            $multiply: [{
                                $divide: ['$five', '$count']
                            }, 100]
                        },
                        rating: {
                            $divide: [{
                                $sum: [{
                                    $multiply: ['$one', 1]
                                }, {
                                    $multiply: ['$two', 2]
                                }, {
                                    $multiply: ['$three', 3]
                                }, {
                                    $multiply: ['$four', 4]
                                }, {
                                    $multiply: ['$five', 5]
                                }]
                            }, {
                                $sum: ['$one', '$two', '$three', '$four', '$five']
                            }]
                        }
                    }
                }
            ]).toArray().catch(() => {
                reject()
            })

            if (stars) {
                if (stars.length !== 0) {
                    resolve(stars[0])
                } else {
                    resolve({
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
                    })
                }
            } else {
                reject()
            }
        })
    },
}
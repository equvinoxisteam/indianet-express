import db from '../Config/Connection.js'
import collections from '../Config/Collection.js'
import { DeleteOneFile } from './deleteFile.js'
import { ObjectId } from 'mongodb'

export default {
    addOneRowSection: (details) => {
        return new Promise(async (resolve, reject) => {
            let check = await db.get().collection(collections.LAYOUT).findOne({
                for: details.for
            }).catch((err) => {
                reject(err)
            })
            if (check === null || check === undefined) {
                db.get().collection(collections.LAYOUT).insertOne(details).then((done) => {
                    resolve(done)
                }).catch((err) => {
                    reject(err)
                })
            } else {
                db.get().collection(collections.LAYOUT).updateOne({
                    for: details.for
                }, {
                    $push: {
                        items: { $each: details.items }
                    },
                    $set: {
                        title: details.title,
                        subTitle: details.subTitle
                    }
                }).then((done) => {
                    resolve(done)
                }).catch((err) => {
                    reject(err)
                })
            }
        })
    },
    saveOneRowSection: (details) => {
        return new Promise(async (resolve, reject) => {
            try {
                const items = (details.items || [])
                    .filter((i) => i && i._id)
                    .map((i) => ({ _id: ObjectId(String(i._id)) }))
                const payload = {
                    for: details.for,
                    title: details.title || '',
                    subTitle: details.subTitle || '',
                    items,
                }
                const existing = await db.get().collection(collections.LAYOUT).findOne({ for: details.for })
                if (!existing) {
                    await db.get().collection(collections.LAYOUT).insertOne(payload)
                } else {
                    await db.get().collection(collections.LAYOUT).updateOne(
                        { for: details.for },
                        { $set: payload }
                    )
                }
                resolve()
            } catch (err) {
                reject(err)
            }
        })
    },
    getSectionsCategory: (name) => {
        var details = {
            title: '',
            subTitle: '',
            items: []
        }
        return new Promise((resolve, reject) => {
            db.get().collection(collections.LAYOUT).findOne({
                for: name
            }).then(async (data) => {
                if (data !== null) {
                    details.title = data.title
                    details.subTitle = data.subTitle
                }
                let items = await db.get().collection(collections.LAYOUT).aggregate([
                    {
                        $match: {
                            for: name
                        }
                    }, {
                        $unwind: '$items'
                    }, {
                        $project: {
                            item: {
                                $toObjectId: '$items._id'
                            }
                        }
                    }, {
                        $lookup: {
                            from: collections.CATEGORIES,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'category'
                        }
                    }, {
                        $project: {
                            _id: 0,
                            item: 1,
                            _id: { $arrayElemAt: ['$category._id', 0] },
                            name: { $arrayElemAt: ['$category.name', 0] },
                            uni_id1: { $arrayElemAt: ['$category.uni_id1', 0] },
                            uni_id2: { $arrayElemAt: ['$category.uni_id2', 0] },
                            file: { $arrayElemAt: ['$category.file', 0] },
                            slug: { $arrayElemAt: ['$category.slug', 0] },
                        }
                    }
                ]).toArray().catch((err) => {
                    reject(err)
                })

                details.items = items
                resolve(details)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    getSectionsRowOne: (name) => {
        var details = {
            title: '',
            subTitle: '',
            items: [],
        }
        return new Promise((resolve, reject) => {
            db.get().collection(collections.LAYOUT).findOne({
                for: name
            }).then(async (data) => {
                if (data !== null) {
                    details.title = data.title
                    details.subTitle = data.subTitle
                }
                let items = await db.get().collection(collections.LAYOUT).aggregate([
                    {
                        $match: {
                            for: name
                        }
                    }, {
                        $unwind: '$items'
                    }, {
                        $project: {
                            item: {
                                $toObjectId: '$items._id'
                            }
                        }
                    }, {
                        $lookup: {
                            from: collections.PRODUCTS,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    }, {
                        $project: {
                            _id: 0,
                            item: 1,
                            _id: { $arrayElemAt: ['$product._id', 0] },
                            name: { $arrayElemAt: ['$product.name', 0] },
                            uni_id_1: { $arrayElemAt: ['$product.uni_id_1', 0] },
                            uni_id_2: { $arrayElemAt: ['$product.uni_id_2', 0] },
                            files: { $arrayElemAt: ['$product.files', 0] },
                            slug: { $arrayElemAt: ['$product.slug', 0] },
                            price: { $arrayElemAt: ['$product.price', 0] },
                            mrp: { $arrayElemAt: ['$product.mrp', 0] },
                            available: { $arrayElemAt: ['$product.available', 0] },
                            category: { $arrayElemAt: ['$product.category', 0] },
                            discount: { $arrayElemAt: ['$product.discount', 0] },
                        }
                    }
                ]).toArray().catch((err) => {
                    reject(err)
                })

                details.items = items
                resolve(details)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    getSectionsRowTwo: (name) => {
        var details = {
            title: '',
            subTitle: '',
            items: [],
            items2: []
        }
        return new Promise((resolve, reject) => {
            db.get().collection(collections.LAYOUT).findOne({
                for: name
            }).then(async (data) => {
                if (data !== null) {
                    details.title = data.title
                    details.subTitle = data.subTitle
                }

                let items1 = await db.get().collection(collections.LAYOUT).aggregate([
                    {
                        $match: {
                            for: name
                        }
                    }, {
                        $unwind: '$items'
                    }, {
                        $project: {
                            item: {
                                $toObjectId: '$items._id'
                            }
                        }
                    }, {
                        $lookup: {
                            from: collections.PRODUCTS,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    }, {
                        $project: {
                            _id: 0,
                            item: 1,
                            _id: { $arrayElemAt: ['$product._id', 0] },
                            name: { $arrayElemAt: ['$product.name', 0] },
                            uni_id_1: { $arrayElemAt: ['$product.uni_id_1', 0] },
                            uni_id_2: { $arrayElemAt: ['$product.uni_id_2', 0] },
                            files: { $arrayElemAt: ['$product.files', 0] },
                            slug: { $arrayElemAt: ['$product.slug', 0] },
                            price: { $arrayElemAt: ['$product.price', 0] },
                            mrp: { $arrayElemAt: ['$product.mrp', 0] },
                            available: { $arrayElemAt: ['$product.available', 0] },
                            category: { $arrayElemAt: ['$product.category', 0] },
                            discount: { $arrayElemAt: ['$product.discount', 0] },
                        }
                    }
                ]).toArray().catch((err) => {
                    reject(err)
                })

                let items2 = await db.get().collection(collections.LAYOUT).aggregate([
                    {
                        $match: {
                            for: name
                        }
                    }, {
                        $unwind: '$items2'
                    }, {
                        $project: {
                            item: {
                                $toObjectId: '$items2._id'
                            }
                        }
                    }, {
                        $lookup: {
                            from: collections.PRODUCTS,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    }, {
                        $project: {
                            _id: 0,
                            item: 1,
                            _id: { $arrayElemAt: ['$product._id', 0] },
                            name: { $arrayElemAt: ['$product.name', 0] },
                            uni_id_1: { $arrayElemAt: ['$product.uni_id_1', 0] },
                            uni_id_2: { $arrayElemAt: ['$product.uni_id_2', 0] },
                            files: { $arrayElemAt: ['$product.files', 0] },
                            slug: { $arrayElemAt: ['$product.slug', 0] },
                            price: { $arrayElemAt: ['$product.price', 0] },
                            mrp: { $arrayElemAt: ['$product.mrp', 0] },
                            available: { $arrayElemAt: ['$product.available', 0] },
                            category: { $arrayElemAt: ['$product.category', 0] },
                            discount: { $arrayElemAt: ['$product.discount', 0] },
                        }
                    }
                ]).toArray().catch((err) => {
                    reject(err)
                })

                details.items = items1
                details.items2 = items2

                resolve(details)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    removeRowOneSection: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.LAYOUT).updateOne({
                for: details.section
            }, {
                $pull: {
                    items: details.item
                }
            }).then((done) => {
                resolve(done)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    removeRowTwoSection: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.LAYOUT).updateOne({
                for: details.section
            }, {
                $pull: {
                    items2: details.item
                }
            }).then((done) => {
                resolve(done)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    addTwoRowSection: (details) => {
        return new Promise(async (resolve, reject) => {
            let check = await db.get().collection(collections.LAYOUT).findOne({
                for: details.for
            }).catch((err) => {
                reject(err)
            })
            if (check === null || check === undefined) {
                db.get().collection(collections.LAYOUT).insertOne(details).then((done) => {
                    resolve(done)
                }).catch((err) => {
                    reject(err)
                })
            } else {
                db.get().collection(collections.LAYOUT).updateOne({
                    for: details.for
                }, {
                    $push: {
                        items: { $each: details.items },
                        items2: { $each: details.items2 }
                    },
                    $set: {
                        title: details.title,
                        subTitle: details.subTitle
                    }
                }).then((done) => {
                    resolve(done)
                }).catch((err) => {
                    reject(err)
                })
            }
        })
    },
    saveTwoRowSection: (details) => {
        return new Promise(async (resolve, reject) => {
            try {
                const mapItems = (list) => (list || [])
                    .filter((i) => i && i._id)
                    .map((i) => ({ _id: ObjectId(String(i._id)) }))
                const payload = {
                    for: details.for,
                    title: details.title || '',
                    subTitle: details.subTitle || '',
                    items: mapItems(details.items),
                    items2: mapItems(details.items2),
                }
                const existing = await db.get().collection(collections.LAYOUT).findOne({ for: details.for })
                if (!existing) {
                    await db.get().collection(collections.LAYOUT).insertOne(payload)
                } else {
                    await db.get().collection(collections.LAYOUT).updateOne(
                        { for: details.for },
                        { $set: payload }
                    )
                }
                resolve()
            } catch (err) {
                reject(err)
            }
        })
    },
    addSlider: (slider, details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.LAYOUT).findOne({
                for: slider
            }).then((layout) => {
                if (layout === null) {
                    db.get().collection(collections.LAYOUT).insertOne({
                        for: slider,
                        items: [details]
                    }).then((done) => {
                        resolve(done)
                    }).catch((err) => {
                        reject(err)
                    })
                } else {
                    db.get().collection(collections.LAYOUT).updateOne({
                        for: slider
                    }, {
                        $push: {
                            items: details
                        }
                    }).then((done) => {
                        resolve(done)
                    }).catch((err) => {
                        reject(err)
                    })
                }
            }).catch((err) => {
                reject(err)
            })
        })
    },
    getSliderOrBanner: (slider) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.LAYOUT).findOne({
                for: slider
            }).then((result) => {
                resolve(result)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    removeSlider: (slider, item) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.LAYOUT).updateOne({
                for: slider
            }, {
                $pull: {
                    items: item
                }
            }).then((done) => {
                resolve()
            }).catch((err) => {
                reject(err)
            })
        })
    },
    updateSliderItem: (sliderFor, uni_id, updates) => {
        return new Promise(async (resolve, reject) => {
            try {
                const layout = await db.get().collection(collections.LAYOUT).findOne({ for: sliderFor })
                if (!layout) return reject(new Error('not_found'))
                const items = (layout.items || []).map((item) => {
                    if (String(item.uni_id) === String(uni_id)) {
                        return { ...item, ...updates }
                    }
                    return item
                })
                await db.get().collection(collections.LAYOUT).updateOne(
                    { for: sliderFor },
                    { $set: { items } }
                )
                resolve()
            } catch (err) {
                reject(err)
            }
        })
    },
    updateBanner: (file, link) => {
        return new Promise(async (resolve, reject) => {
            try {
                const banner = await db.get().collection(collections.LAYOUT).findOne({ for: 'banner' })
                if (!banner) {
                    if (!file) return reject(new Error('banner_image_required'))
                    await db.get().collection(collections.LAYOUT).insertOne({
                        for: 'banner',
                        file,
                        link: link || '',
                    })
                    return resolve()
                }
                const update = { link: link || '' }
                if (file) {
                    update.file = file
                    if (banner.file?.filename) {
                        DeleteOneFile(`./uploads/banner/${banner.file.filename}`, () => {})
                    }
                }
                await db.get().collection(collections.LAYOUT).updateOne(
                    { for: 'banner' },
                    { $set: update }
                )
                resolve()
            } catch (err) {
                reject(err)
            }
        })
    },
    addBanner: (file, link) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.LAYOUT).findOne({
                for: 'banner'
            }).then((data) => {
                if (data === null) {
                    db.get().collection(collections.LAYOUT).insertOne({
                        for: 'banner',
                        file: file,
                        link: link
                    }).then(() => {
                        resolve()
                    }).catch((err) => {
                        reject(err)
                    })
                } else {
                    db.get().collection(collections.LAYOUT).findOne({
                        for: 'banner'
                    }).then((banner) => {
                        DeleteOneFile(`./uploads/banner/${banner.file.filename}`, (done) => {
                            db.get().collection(collections.LAYOUT).updateOne({
                                for: 'banner'
                            }, {
                                $set: {
                                    file: file,
                                    link: link
                                }
                            }).then(() => {
                                resolve()
                            }).catch((err) => {
                                reject(err)
                            })
                        })
                    })
                }
            }).catch((err) => {
                reject(err)
            })
        })
    },
    deleteBanner: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.LAYOUT).deleteOne({
                for: 'banner'
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
    }
}
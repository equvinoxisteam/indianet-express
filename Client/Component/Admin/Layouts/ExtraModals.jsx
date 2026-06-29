import React, { Fragment, useRef, useEffect } from 'react'
import { useState } from 'react'
import { adminAxios, ServerId } from '../../../Config/Server'
import JoditEditor from 'jodit-react';
import toast from 'react-hot-toast';

function ExtraModals({
    activeModal, setActiveModal,
    setSliderOne, setSliderTwo, setBannerPage, logOut
}) {

    let modalRef = useRef()
    const editItem = activeModal.editItem
    const isEdit = Boolean(editItem)

    const [thumb, setThumb] = useState('')

    const [slider1, setSlider1] = useState({
        title: '',
        content: '',
        subContent: '',
        btnLink: '',
        btn: '',
        image: ''
    })

    const [slider2, setSlider2] = useState({
        image: '',
        link: ''
    })

    const [banner, setBanner] = useState({
        link: '',
        image: ''
    })

    useEffect(() => {
        if (!activeModal.active) return

        if (activeModal.for === 'slider' && editItem) {
            setSlider1({
                title: editItem.title || '',
                content: editItem.content || '',
                subContent: editItem.subContent || '',
                btnLink: editItem.btnLink || '',
                btn: editItem.btn || '',
                image: '',
            })
            if (editItem.file?.filename) {
                setThumb(`${ServerId}/sliderOne/${editItem.uni_id}/${editItem.file.filename}`)
            }
        } else if (activeModal.for === 'slider' && !editItem) {
            setSlider1({ title: '', content: '', subContent: '', btnLink: '', btn: '', image: '' })
            setThumb('')
        }

        if (activeModal.for === 'slidertwo' && editItem) {
            setSlider2({ link: editItem.link || '', image: '' })
            if (editItem.file?.filename) {
                setThumb(`${ServerId}/sliderTwo/${editItem.uni_id}/${editItem.file.filename}`)
            }
        } else if (activeModal.for === 'slidertwo' && !editItem) {
            setSlider2({ link: '', image: '' })
            setThumb('')
        }

        if (activeModal.for === 'banner' && editItem) {
            setBanner({ link: editItem.link || '', image: '' })
            if (editItem.file?.filename) {
                setThumb(`${ServerId}/banner/${editItem.file.filename}`)
            }
        } else if (activeModal.for === 'banner' && !editItem) {
            setBanner({ link: '', image: '' })
            setThumb('')
        }
    }, [activeModal.active, activeModal.for, editItem])

    useEffect(() => {
        if (activeModal.btn === true) {
            setActiveModal({ ...activeModal, btn: false })
        } else {
            window.addEventListener('click', closePopUpBody);
            function closePopUpBody(event) {
                if (!modalRef.current?.contains(event.target)) {
                    setActiveModal({ ...activeModal, active: false, for: '', editItem: null })
                }
            }
            return () => window.removeEventListener('click', closePopUpBody)
        }
    })

    function closeModal() {
        setActiveModal({ ...activeModal, btn: false, active: false, for: '', editItem: null })
    }

    function GetLayouts() {
        adminAxios((server) => {
            server.get('/admin/getLayouts').then((layout) => {
                if (layout.data.login) {
                    logOut()
                } else {
                    if (layout.data.sliderOne !== null) {
                        setSliderOne(layout.data.sliderOne)
                    }
                    if (layout.data.sliderTwo !== null) {
                        setSliderTwo(layout.data.sliderTwo)
                    }
                    if (layout.data.banner !== null) {
                        setBannerPage(layout.data.banner)
                    }
                }
            }).catch(() => {
                console.log('error')
            })
        })
    }

    function slider1Form(e) {
        e.preventDefault();

        if (isEdit) {
            const formData = new FormData()
            formData.append('for', 'sliderOne')
            formData.append('uni_id', editItem.uni_id)
            formData.append('details', JSON.stringify({
                title: slider1.title,
                content: slider1.content,
                subContent: slider1.subContent,
                btn: slider1.btn,
                btnLink: slider1.btnLink,
            }))
            if (slider1.image) {
                formData.append('image', slider1.image)
            }
            adminAxios((server) => {
                server.put('/admin/updateSlider', formData, {
                    headers: { 'Content-type': 'multipart/form-data' },
                }).then((data) => {
                    if (data.data.login) logOut()
                    else { GetLayouts(); closeModal(); toast.success('Slider updated') }
                }).catch(() => toast.error('Could not update slider'))
            })
            return
        }

        if (!slider1.image) {
            toast.error('Please upload an image')
            return
        }

        var formData = new FormData()
        var uni_id = Date.now() + Math.random()
        formData.append('for', 'sliderOne')
        formData.append('uni_id', uni_id)
        formData.append('details', JSON.stringify({
            title: slider1.title,
            content: slider1.content,
            subContent: slider1.subContent,
            btn: slider1.btn,
            btnLink: slider1.btnLink
        }))
        formData.append('image', slider1.image)

        adminAxios((server) => {
            server.post('/admin/addSlider/', formData, {
                headers: { 'Content-type': 'multipart/form-data' },
            }).then((data) => {
                if (data.data.login) logOut()
                else { GetLayouts(); closeModal(); toast.success('Slider added') }
            }).catch(() => toast.error('Sorry Server Has Some Problem'))
        })
    }

    function slider2Form(e) {
        e.preventDefault();

        if (isEdit) {
            const formData = new FormData()
            formData.append('for', 'sliderTwo')
            formData.append('uni_id', editItem.uni_id)
            formData.append('details', JSON.stringify({ link: slider2.link }))
            if (slider2.image) formData.append('image', slider2.image)
            adminAxios((server) => {
                server.put('/admin/updateSlider', formData, {
                    headers: { 'Content-type': 'multipart/form-data' },
                }).then((data) => {
                    if (data.data.login) logOut()
                    else { GetLayouts(); closeModal(); toast.success('Slider updated') }
                }).catch(() => toast.error('Could not update slider'))
            })
            return
        }

        if (!slider2.image) {
            toast.error('Please upload an image')
            return
        }

        var formData = new FormData()
        var uni_id = Date.now() + Math.random()
        formData.append('for', 'sliderTwo')
        formData.append('uni_id', uni_id)
        formData.append('details', JSON.stringify({ type: 'banner/slider', link: slider2.link }))
        formData.append('image', slider2.image)

        adminAxios((server) => {
            server.post('/admin/addSlider/', formData, {
                headers: { 'Content-type': 'multipart/form-data' },
            }).then((data) => {
                if (data.data.login) logOut()
                else { GetLayouts(); closeModal(); toast.success('Slider added') }
            }).catch(() => toast.error('Sorry Server Has Some Problem'))
        })
    }

    function bannerForm(e) {
        e.preventDefault();

        if (isEdit) {
            const formData = new FormData()
            formData.append('link', banner.link)
            if (banner.image) formData.append('image', banner.image)
            adminAxios((server) => {
                server.put('/admin/updateBanner', formData, {
                    headers: { 'Content-type': 'multipart/form-data' },
                }).then((data) => {
                    if (data.data.login) logOut()
                    else { GetLayouts(); closeModal(); toast.success('Banner updated') }
                }).catch(() => toast.error('Could not update banner'))
            })
            return
        }

        if (!banner.image) {
            toast.error('Please upload an image')
            return
        }

        var formData = new FormData()
        formData.append('uni_id', Date.now() + Math.random())
        formData.append('link', banner.link)
        formData.append('image', banner.image)

        adminAxios((server) => {
            server.post('/admin/addBanner', formData, {
                headers: { 'Content-type': 'multipart/form-data' },
            }).then((data) => {
                if (data.data.login) logOut()
                else { GetLayouts(); closeModal(); toast.success('Banner saved') }
            }).catch(() => toast.error('Sorry Server Has Some Problem'))
        })
    }

    return (
        <Fragment>
            {
                activeModal.for === "slider" && (
                    <div className='LayoutModal'>
                        <div className='inner'>
                            <div className="innerMain" ref={modalRef}>
                                <div className='ExitDiv'>
                                    <button type="button" onClick={closeModal}>CLOSE</button>
                                </div>
                                <div className="row">
                                    <form onSubmit={slider1Form}>
                                        <div className="col-12">
                                            <label>{isEdit ? 'Edit hero slide' : 'Add hero slide'}</label>
                                        </div>
                                        <div className="col-12">
                                            <label htmlFor="">Title</label>
                                            <br />
                                            <input value={slider1.title} onInput={(e) => {
                                                setSlider1({ ...slider1, title: e.target.value })
                                            }} type="text" required />
                                        </div>
                                        <div className="col-12">
                                            <label htmlFor="">Button Name</label>
                                            <br />
                                            <input value={slider1.btn} onInput={(e) => {
                                                setSlider1({ ...slider1, btn: e.target.value })
                                            }} required type="text" />
                                        </div>
                                        <div className="col-12">
                                            <label htmlFor="">Button Link</label>
                                            <br />
                                            <input value={slider1.btnLink} onInput={(e) => {
                                                setSlider1({ ...slider1, btnLink: e.target.value })
                                            }} required type="text" />
                                        </div>
                                        <div className="col-12">
                                            <label htmlFor="">Content</label>
                                            <br />
                                            <div>
                                                <JoditEditor
                                                    value={slider1.content}
                                                    tabIndex={100}
                                                    onBlur={newContent => setSlider1({
                                                        ...slider1,
                                                        content: newContent,
                                                    })}
                                                />
                                            </div>
                                            <br />
                                        </div>
                                        <div className="col-12">
                                            <label htmlFor="">Sub Content</label>
                                            <br />
                                            <input value={slider1.subContent} onInput={(e) => {
                                                setSlider1({ ...slider1, subContent: e.target.value })
                                            }} type="text" />
                                        </div>
                                        {thumb && (
                                            <div>
                                                <img src={thumb} className='thumnail' alt="" />
                                            </div>
                                        )}
                                        <div className="col-12">
                                            <label htmlFor="">Image <small className='text-muted'>(1920 x 600 px){isEdit ? ' — leave empty to keep current' : ''}</small></label>
                                            <br />
                                            <input onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (!file) return
                                                setSlider1({ ...slider1, image: file })
                                                setThumb(URL.createObjectURL(file))
                                            }} type="file" accept='image/*' required={!isEdit} />
                                        </div>
                                        <div className="col-12">
                                            <button className='submitBnt' type="submit">{isEdit ? 'Update' : 'Add'}</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                activeModal.for === "slidertwo" && (
                    <div className='LayoutModal'>
                        <div className='inner'>
                            <div className="innerMain" ref={modalRef}>
                                <div className='ExitDiv'>
                                    <button type="button" onClick={closeModal}>CLOSE</button>
                                </div>
                                <div className="row">
                                    <form onSubmit={slider2Form}>
                                        <div className="col-12">
                                            <label>{isEdit ? 'Edit mid-page banner' : 'Add mid-page banner'}</label>
                                        </div>
                                        <div className="col-12">
                                            <label htmlFor="">Link</label>
                                            <br />
                                            <input value={slider2.link} onChange={(e) => {
                                                setSlider2({ ...slider2, link: e.target.value })
                                            }} type="text" />
                                        </div>
                                        {thumb && (
                                            <div>
                                                <img src={thumb} className='thumnail' alt="" />
                                            </div>
                                        )}
                                        <div className="col-12">
                                            <label htmlFor="">Image{isEdit ? ' (optional — keep current if empty)' : ''}</label>
                                            <br />
                                            <input onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (!file) return
                                                setSlider2({ ...slider2, image: file })
                                                setThumb(URL.createObjectURL(file))
                                            }} type="file" accept='image/*' required={!isEdit} />
                                        </div>
                                        <div className="col-12">
                                            <button className='submitBnt' type="submit">{isEdit ? 'Update' : 'Add'}</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                activeModal.for === "banner" && (
                    <div className='LayoutModal'>
                        <div className='inner'>
                            <div className="innerMain" ref={modalRef}>
                                <div className='ExitDiv'>
                                    <button type="button" onClick={closeModal}>CLOSE</button>
                                </div>
                                <div className="row">
                                    <form onSubmit={bannerForm}>
                                        <div className="col-12">
                                            <label>{isEdit ? 'Edit bottom banner' : 'Add bottom banner'}</label>
                                        </div>
                                        <div className="col-12">
                                            <label htmlFor="">Link</label>
                                            <br />
                                            <input value={banner.link} onChange={(e) => {
                                                setBanner({ ...banner, link: e.target.value })
                                            }} type="text" />
                                        </div>
                                        {thumb && (
                                            <div>
                                                <img src={thumb} className='thumnail' alt="" />
                                            </div>
                                        )}
                                        <div className="col-12">
                                            <label htmlFor="">Image{isEdit ? ' (optional)' : ''}</label>
                                            <br />
                                            <input onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (!file) return
                                                setBanner({ ...banner, image: file })
                                                setThumb(URL.createObjectURL(file))
                                            }} type="file" accept='image/*' required={!isEdit} />
                                        </div>
                                        <div className="col-12">
                                            <button className='submitBnt' type="submit">{isEdit ? 'Update' : 'Add'}</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </Fragment>
    )
}

export default ExtraModals

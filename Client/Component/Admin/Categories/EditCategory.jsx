import React from 'react'
import { useRef } from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import { adminAxios, ServerId } from '../../../Config/Server'
import toast from 'react-hot-toast';

function EditCategory({ editModal, setEditModal, setCategories, editCategory, logOut }) {
    const [thumbPrev, setThumbPrev] = useState('')
    const [thumb, setThumb] = useState(null)
    const [name, setName] = useState('')

    var modalRef = useRef()

    useEffect(() => {
        if (!editCategory?._id) return
        setName(editCategory.name || '')
        setThumb(null)
        const fname = editCategory.file?.filename || editCategory.file?.originalname
        if (fname && editCategory.uni_id1) {
            setThumbPrev(`${ServerId}/category/${editCategory.uni_id1}${editCategory.uni_id2}/${fname}`)
        } else {
            setThumbPrev('')
        }
    }, [editCategory])

    useEffect(() => {
        if (editModal.btn === true) {
            setEditModal({ ...editModal, btn: false })
        } else {
            window.addEventListener('click', closePopUpBody);
            function closePopUpBody(event) {
                if (!modalRef.current?.contains(event.target)) {
                    setEditModal({ ...editModal, active: false })
                }
            }
            return () => window.removeEventListener('click', closePopUpBody)
        }
    })

    function formhandler(e) {
        e.preventDefault()

        let formData = new FormData()
        formData.append('name', name)
        formData.append('uni_id1', editCategory.uni_id1)
        formData.append('uni_id2', editCategory.uni_id2)
        formData.append('cateId', editCategory._id)
        formData.append('oldFile', JSON.stringify(editCategory.file))
        if (thumb) {
            formData.append('image', thumb)
        }

        adminAxios((server) => {
            server.put('/admin/editCategory', formData, {
                headers: {
                    "Content-type": "multipart/form-data",
                },
            }).then((done) => {
                if (done.data.login) {
                    logOut()
                } else {
                    adminAxios((server) => {
                        server.get('/admin/getCatgories').then((data) => {
                            if (data.data.login) {
                                logOut()
                            } else {
                                setCategories(data.data)
                            }
                        }).catch((err) => {
                            console.log('err')
                        })

                        toast.success("Category updated")

                        setEditModal({
                            ...editModal,
                            btn: false,
                            active: false,
                        })
                    })
                }
            }).catch((err) => {
                toast.error('Facing An Error')
            })
        })

    }

    return (
        <div className='CategoryModal'>
            <div className='inner'>
                <div className="innerMain" ref={modalRef}>
                    <div className='ExitDiv'>
                        <button onClick={() => {
                            setEditModal({
                                ...editModal,
                                btn: false,
                                active: false
                            })
                        }}>CLOSE</button>
                    </div>
                    <div className="row">
                        <form onSubmit={formhandler}>
                            <div className="col-12">
                                <label htmlFor="">Name</label>
                                <br />
                                <input value={name} type="text" onInput={(e) => {
                                    setName(e.target.value)
                                }} required />
                            </div>
                            {
                                thumbPrev && (
                                    <div className='col-12'>
                                        <img className='thumnail' src={thumbPrev} alt="" />
                                    </div>
                                )
                            }
                            <div className="col-12">
                                <label htmlFor="">Image <small className="text-muted">(optional — leave empty to keep current)</small></label>
                                <br />
                                <input type="file" onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (!file) return
                                    setThumb(file)
                                    setThumbPrev(URL.createObjectURL(file))
                                }} accept='image/*' />
                            </div>
                            <div className="col-12">
                                <button className='submitBnt'>Update category</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditCategory

import { vendorAxios, ServerId } from "@/Config/Server"
import { useState, useEffect, useRef } from "react"
import toast from 'react-hot-toast';
import { useRouter } from "next/router";
import VendorPickupAddresses from './VendorPickupAddresses'

const MAX_STORE_CERTIFICATES = 5

function SettingsComp({ venderLogged, setVendorLogged }) {
    const router = useRouter()
    
    const [formData, setFormData] = useState({
        email: venderLogged.email,
        number: venderLogged.number,
        country: venderLogged.country || 'India',
        state: venderLogged.state || '',
        city: venderLogged.city || '',
        locality: venderLogged.locality || '',
        address: venderLogged.address || '',
        pinCode: venderLogged.pinCode || '',
        gstin: venderLogged.gstin || '',
        panNumber: venderLogged.panNumber || '',
        vendorIdCheck: venderLogged._id,
        bankAccOwner: venderLogged.bankAccOwner,
        bankName: venderLogged.bankName,
        bankAccNumber: venderLogged.bankAccNumber,
        bankIFSC: venderLogged.bankIFSC,
        bankBranchName: venderLogged.bankBranchName,
        bankBranchNumber: venderLogged.bankBranchNumber,
    })

    const [profileData, setProfileData] = useState({
        website: '',
        description: '',
        companyInfo: '',
        backgroundImage: '',
        logo: '',
        socialLinks: {
            facebook: '',
            instagram: '',
            twitter: '',
            linkedin: ''
        },
        companyIntroduction: '',
        businessType: '',
        yearsInIndustry: '',
        cooperatedSuppliers: '',
        countryRegion: '',
        mainCategories: '',
        mainMarkets: [],
        yearEstablished: '',
        employeesRange: '',
        factorySizeRange: '',
        annualOutputRange: '',
        verificationTags: [],
        companyHighlights: [],
        certificateImages: [],
        designCustomization: false,
        fullCustomization: false,
        annualRevenueNote: '',
        exhibitionsNote: ''
    })

    const [bannerFile, setBannerFile] = useState(null)
    const [logoFile, setLogoFile] = useState(null)
    /** New certificate uploads with live preview: { id, file, url } */
    const [pendingCerts, setPendingCerts] = useState([])

    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('profile')

    const [bannerPreviewUrl, setBannerPreviewUrl] = useState(null)
    const [logoPreviewUrl, setLogoPreviewUrl] = useState(null)

    const pendingCertsRef = useRef([])
    pendingCertsRef.current = pendingCerts
    useEffect(() => () => {
        pendingCertsRef.current.forEach((c) => {
            if (c?.url) try { URL.revokeObjectURL(c.url) } catch (_) { /* noop */ }
        })
    }, [])

    useEffect(() => {
        if (!bannerFile) {
            setBannerPreviewUrl(null)
            return
        }
        const u = URL.createObjectURL(bannerFile)
        setBannerPreviewUrl(u)
        return () => URL.revokeObjectURL(u)
    }, [bannerFile])

    useEffect(() => {
        if (!logoFile) {
            setLogoPreviewUrl(null)
            return
        }
        const u = URL.createObjectURL(logoFile)
        setLogoPreviewUrl(u)
        return () => URL.revokeObjectURL(u)
    }, [logoFile])

    useEffect(() => {
        fetchVendorProfile()
    }, [])

    const fetchVendorProfile = () => {
        setLoading(true)
        vendorAxios((server) => {
            server.get('/vendor/getProfile').then((res) => {
                if (res.data.status !== false && res.data._id) {
                    const d = res.data
                    setProfileData({
                        website: d.website || '',
                        description: d.description || '',
                        companyInfo: d.companyInfo || '',
                        backgroundImage: d.backgroundImage || '',
                        logo: d.logo || '',
                        socialLinks: d.socialLinks || {
                            facebook: '',
                            instagram: '',
                            twitter: '',
                            linkedin: ''
                        },
                        companyIntroduction: d.companyIntroduction || '',
                        businessType: d.businessType || '',
                        yearsInIndustry: d.yearsInIndustry || '',
                        cooperatedSuppliers: d.cooperatedSuppliers || '',
                        countryRegion: d.countryRegion || '',
                        mainCategories: d.mainCategories || '',
                        mainMarkets: Array.isArray(d.mainMarkets) ? d.mainMarkets : [],
                        yearEstablished: d.yearEstablished || '',
                        employeesRange: d.employeesRange || '',
                        factorySizeRange: d.factorySizeRange || '',
                        annualOutputRange: d.annualOutputRange || '',
                        verificationTags: Array.isArray(d.verificationTags) ? d.verificationTags : [],
                        companyHighlights: Array.isArray(d.companyHighlights) ? d.companyHighlights : [],
                        certificateImages: (Array.isArray(d.certificateImages) ? d.certificateImages : []).slice(0, MAX_STORE_CERTIFICATES),
                        designCustomization: d.designCustomization === true,
                        fullCustomization: d.fullCustomization === true,
                        annualRevenueNote: d.annualRevenueNote || '',
                        exhibitionsNote: d.exhibitionsNote || ''
                    })
                }
            }).catch(() => {
                console.log('Error fetching profile')
            }).finally(() => {
                setLoading(false)
            })
        })
    }

    const updateUserDetails = (e) => {
        e.preventDefault()
        if (String(formData.number || '').replace(/\D/g, '').length === 10) {
            vendorAxios((server) => {
                server.put('/vendor/updateUserDetails', {
                    email: formData.email,
                    number: formData.number,
                    country: formData.country,
                    state: formData.state,
                    city: formData.city,
                    locality: formData.locality,
                    address: formData.address,
                    pinCode: formData.pinCode,
                    gstin: formData.gstin,
                    panNumber: formData.panNumber,
                    vendorIdCheck: formData.vendorIdCheck
                }).then((res) => {
                    if (res.data.login) {
                        setVendorLogged({ status: false })
                        localStorage.removeItem('vendorToken')
                        router.push('/vendor/login')
                    } else {
                        if (res.data.email) {
                            setFormData({
                                ...formData,
                                email: venderLogged.email,
                                number: venderLogged.number
                            })
                            toast.success("Email Already Use")
                        } else {
                            setVendorLogged({
                                ...venderLogged,
                                email: formData.email.toLowerCase(),
                                number: formData.number,
                                country: formData.country,
                                state: formData.state,
                                city: formData.city,
                                locality: formData.locality,
                                address: formData.address,
                                pinCode: formData.pinCode,
                                gstin: formData.gstin,
                                panNumber: formData.panNumber
                            })

                            setFormData({
                                ...formData,
                                email: formData.email.toLowerCase(),
                            })
                            toast.success("Updated")
                        }
                    }
                }).catch(() => {
                    setFormData({
                        ...formData,
                        email: venderLogged.email,
                        number: venderLogged.number,
                        country: venderLogged.country || 'India',
                        state: venderLogged.state || '',
                        city: venderLogged.city || '',
                        locality: venderLogged.locality || '',
                        address: venderLogged.address || '',
                        pinCode: venderLogged.pinCode || '',
                        gstin: venderLogged.gstin || '',
                        panNumber: venderLogged.panNumber || ''
                    })
                    toast.error("Error")
                })
            })
        } else {
            toast.error("Mobile Number Must 10 Digit")
        }
    }

    const updateBankAccount = (e) => {
        e.preventDefault()
        vendorAxios((server) => {
            server.put('/vendor/updateBankAccount', {
                vendorIdCheck: formData.vendorIdCheck,
                bankAccOwner: formData.bankAccOwner,
                bankName: formData.bankName,
                bankAccNumber: formData.bankAccNumber,
                bankIFSC: formData.bankIFSC,
                bankBranchName: formData.bankBranchName,
                bankBranchNumber: formData.bankBranchNumber,
            }).then((res) => {
                if (res.data.login) {
                    setVendorLogged({ status: false })
                    localStorage.removeItem('vendorToken')
                    router.push('/vendor/login')
                } else {
                    setVendorLogged({
                        ...venderLogged,
                        bankAccOwner: formData.bankAccOwner,
                        bankName: formData.bankName,
                        bankAccNumber: formData.bankAccNumber,
                        bankIFSC: formData.bankIFSC,
                        bankBranchName: formData.bankBranchName,
                        bankBranchNumber: formData.bankBranchNumber,
                    })
                    toast.success("Updated")
                }
            }).catch(() => {
                setFormData({
                    ...formData,
                    bankAccOwner: venderLogged.bankAccOwner,
                    bankName: venderLogged.bankName,
                    bankAccNumber: venderLogged.bankAccNumber,
                    bankIFSC: venderLogged.bankIFSC,
                    bankBranchName: venderLogged.bankBranchName,
                    bankBranchNumber: venderLogged.bankBranchNumber,
                })
                toast.error("Error")
            })
        })
    }

    const appendStoreProfileForm = (formDataUpload) => {
        formDataUpload.append('website', profileData.website)
        formDataUpload.append('description', profileData.description)
        formDataUpload.append('companyInfo', profileData.companyInfo)
        formDataUpload.append('socialLinks', JSON.stringify(profileData.socialLinks))
        formDataUpload.append('companyIntroduction', profileData.companyIntroduction)
        formDataUpload.append('businessType', profileData.businessType)
        formDataUpload.append('yearsInIndustry', profileData.yearsInIndustry)
        formDataUpload.append('cooperatedSuppliers', profileData.cooperatedSuppliers)
        formDataUpload.append('countryRegion', profileData.countryRegion)
        formDataUpload.append('mainCategories', profileData.mainCategories)
        formDataUpload.append('mainMarkets', JSON.stringify(profileData.mainMarkets || []))
        formDataUpload.append('yearEstablished', profileData.yearEstablished)
        formDataUpload.append('employeesRange', profileData.employeesRange)
        formDataUpload.append('factorySizeRange', profileData.factorySizeRange)
        formDataUpload.append('annualOutputRange', profileData.annualOutputRange)
        formDataUpload.append('companyHighlights', JSON.stringify(profileData.companyHighlights || []))
        formDataUpload.append('existingCertificates', JSON.stringify(profileData.certificateImages || []))
        formDataUpload.append('designCustomization', profileData.designCustomization ? 'true' : 'false')
        formDataUpload.append('fullCustomization', profileData.fullCustomization ? 'true' : 'false')
        formDataUpload.append('annualRevenueNote', profileData.annualRevenueNote)
        formDataUpload.append('exhibitionsNote', profileData.exhibitionsNote)
        formDataUpload.append('vendorId', venderLogged._id)
    }

    const updateProfile = (e) => {
        e.preventDefault()
        const existingCount = (profileData.certificateImages || []).length
        const pendingCount = pendingCerts.length
        if (existingCount + pendingCount > MAX_STORE_CERTIFICATES) {
            toast.error(`You can upload at most ${MAX_STORE_CERTIFICATES} certificate images (you have ${existingCount}, adding ${pendingCount}).`)
            return
        }
        const formDataUpload = new FormData()
        appendStoreProfileForm(formDataUpload)
        if (bannerFile) {
            formDataUpload.append('images', bannerFile)
        }
        if (logoFile) {
            formDataUpload.append('logo', logoFile)
        }
        pendingCerts.forEach((c) => formDataUpload.append('certificates', c.file))

        vendorAxios((server) => {
            server.put('/vendor/updateProfile', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }).then((res) => {
                toast.success('Profile updated successfully!')
                pendingCerts.forEach((c) => { if (c?.url) try { URL.revokeObjectURL(c.url) } catch (_) { /* noop */ } })
                setPendingCerts([])
                setBannerFile(null)
                setLogoFile(null)
                fetchVendorProfile()
            }).catch(() => {
                toast.error('Error updating profile')
            })
        })
    }

    const slotsForCerts = () => MAX_STORE_CERTIFICATES - (profileData.certificateImages || []).length - pendingCerts.length

    const addPendingCertificates = (fileList) => {
        const picked = Array.from(fileList || [])
        if (picked.length === 0) return
        const prev = pendingCertsRef.current
        const existing = (profileData.certificateImages || []).length
        const room = MAX_STORE_CERTIFICATES - existing - prev.length
        if (room <= 0) {
            toast.error(`Maximum ${MAX_STORE_CERTIFICATES} certificates reached.`)
            return
        }
        const slice = picked.slice(0, room)
        if (picked.length > room) {
            toast.error(`Only ${room} more certificate image(s) allowed.`)
        }
        setPendingCerts([
            ...prev,
            ...slice.map((file, i) => ({
                id: `pc-${Date.now()}-${i}-${file.name}`,
                file,
                url: URL.createObjectURL(file)
            }))
        ])
    }

    const removePendingCert = (id) => {
        setPendingCerts((prev) => {
            const t = prev.find((x) => x.id === id)
            if (t?.url) URL.revokeObjectURL(t.url)
            return prev.filter((x) => x.id !== id)
        })
    }

    return (
        <div className='SettingsComp containerVendor'>
            <div className="row">
                <div className="col-lg-3 col-md-4">
                    <div className="accDetailsMain sticky-top" style={{ top: '118px', zIndex: 10 }}>
                        {/* Tab Navigation */}
                        <div className="mb-1">
                            <button
                                type="button"
                                className={`settingsNavPill ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                <span>Store profile</span>
                            </button>
                            <button
                                type="button"
                                className={`settingsNavPill ${activeTab === 'details' ? 'active' : ''}`}
                                onClick={() => setActiveTab('details')}
                            >
                                <span>Personal details</span>
                            </button>
                            <button
                                type="button"
                                className={`settingsNavPill ${activeTab === 'pickup' ? 'active' : ''}`}
                                onClick={() => setActiveTab('pickup')}
                            >
                                <span>Pickup addresses</span>
                            </button>
                            <button
                                type="button"
                                className={`settingsNavPill ${activeTab === 'bank' ? 'active' : ''}`}
                                onClick={() => setActiveTab('bank')}
                            >
                                <span>Bank account</span>
                            </button>
                        </div>

                        {activeTab === 'profile' && (
                            <div className="text-center p-3 border-top mt-2 pt-3">
                                <div
                                    className="rounded-circle overflow-hidden mx-auto mb-3 border bg-light"
                                    style={{ width: '100px', height: '100px' }}
                                >
                                    {logoPreviewUrl ? (
                                        <img src={logoPreviewUrl} alt="" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                                    ) : profileData.logo ? (
                                        <img src={`${ServerId}${profileData.logo}`} alt="" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                                    ) : (
                                        <div className="w-100 h-100 bg-primary d-flex align-items-center justify-content-center">
                                            <i className="fa-solid fa-store text-white" style={{ fontSize: '2.5rem' }}></i>
                                        </div>
                                    )}
                                </div>
                                <h6 className="font-bold mb-1">{venderLogged.name}</h6>
                                <small className="text-muted d-block text-truncate px-1" title={venderLogged.email}>{venderLogged.email}</small>
                            </div>
                        )}

                        {activeTab === 'details' && (
                            <div className="row g-2 pt-2 small">
                                <div className="col-12">
                                    <label className="form-label text-muted mb-0 small">Legal name</label>
                                    <input className="form-control form-control-sm" type="text" value={venderLogged.adharName} disabled readOnly />
                                </div>
                                <div className="col-12">
                                    <label className="form-label text-muted mb-0 small">Email</label>
                                    <input className="form-control form-control-sm" type="text" value={venderLogged.email} disabled readOnly />
                                </div>
                                <div className="col-12">
                                    <label className="form-label text-muted mb-0 small">Mobile</label>
                                    <input className="form-control form-control-sm" type="text" value={venderLogged.number} disabled readOnly />
                                </div>
                                <div className="col-12">
                                    <label className="form-label text-muted mb-0 small">Aadhaar</label>
                                    <input className="form-control form-control-sm" type="text" value={venderLogged.adharNumber} disabled readOnly />
                                </div>
                                <div className="col-12">
                                    <label className="form-label text-muted mb-0 small">PAN</label>
                                    <input
                                        className="form-control form-control-sm"
                                        type="text"
                                        value={formData.panNumber}
                                        onInput={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                                        placeholder="PAN / tax ID"
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label text-muted mb-0 small">GSTIN</label>
                                    <input className="form-control form-control-sm" type="text" value={venderLogged.gstin} disabled readOnly />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-lg-9 col-md-8">
                    {/* Store Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="settingsProfileCard">
                            <div className="vendorPageHeader">
                                <h1 className="vendorPageTitle">Store profile</h1>
                                <p className="vendorPageSubtitle">
                                    Add any fields you like — only what you fill in appears on your public storefront.
                                    Personal details and bank information are never shown to buyers (admin only).
                                </p>
                            </div>

                            <form onSubmit={updateProfile}>
                                <div className="row">
                                    <div className="col-12 mb-4">
                                        <h3 className="settingsProfileCardTitle">Store imagery</h3>
                                    </div>

                                    <div className="col-12 mb-4">
                                        <label className="form-label fw-bold">Store banner (1 image)</label>
                                        {(bannerPreviewUrl || profileData.backgroundImage) && (
                                            <div className="mb-3 rounded overflow-hidden border" style={{ maxHeight: 220 }}>
                                                <img
                                                    src={bannerPreviewUrl || `${ServerId}${profileData.backgroundImage}`}
                                                    alt="Store banner"
                                                    className="w-100 h-100"
                                                    style={{ maxHeight: 220, objectFit: 'cover' }}
                                                />
                                            </div>
                                        )}
                                        <label className="vendorDropZone mb-2 d-block">
                                            <input
                                                type="file"
                                                className="d-none"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const f = e.target.files?.[0]
                                                    setBannerFile(f || null)
                                                    e.target.value = ''
                                                }}
                                            />
                                            <p className="vendorDropZoneTitle mb-1"><i className="fa-solid fa-panorama me-2" aria-hidden></i>Choose banner image</p>
                                            <p className="vendorDropZoneHint">Wide banner · recommended 1600×400px or 1200×300px (4:1)</p>
                                        </label>
                                        {bannerFile && (
                                            <button type="button" className="vendorBtnSecondary" onClick={() => setBannerFile(null)}>Clear new banner</button>
                                        )}
                                        <span className="vendorDimHint">Saves when you click Save profile.</span>
                                    </div>

                                    <div className="col-12 mb-4">
                                        <label className="form-label fw-bold">Store logo</label>
                                        <div className="row g-3 align-items-start">
                                            <div className="col-auto">
                                                <div className="rounded-circle overflow-hidden border bg-light" style={{ width: 120, height: 120 }}>
                                                    {logoPreviewUrl || profileData.logo ? (
                                                        <img
                                                            src={logoPreviewUrl || `${ServerId}${profileData.logo}`}
                                                            alt=""
                                                            className="w-100 h-100"
                                                            style={{ objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                                                            <i className="fa-solid fa-image fa-2x" aria-hidden></i>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col">
                                                <label className="vendorDropZone mb-0 d-block">
                                                    <input
                                                        type="file"
                                                        className="d-none"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const f = e.target.files?.[0]
                                                            setLogoFile(f || null)
                                                            e.target.value = ''
                                                        }}
                                                    />
                                                    <p className="vendorDropZoneTitle mb-1"><i className="fa-solid fa-cloud-arrow-up me-2" aria-hidden></i>Upload logo</p>
                                                    <p className="vendorDropZoneHint">Square works best · recommended 400×400px (1:1)</p>
                                                </label>
                                                {logoFile && (
                                                    <button type="button" className="vendorBtnSecondary mt-2" onClick={() => setLogoFile(null)}>Remove new logo</button>
                                                )}
                                            </div>
                                        </div>
                                        <span className="vendorDimHint">Shown on your storefront and in the sidebar preview.</span>
                                    </div>

                                    <div className="col-12 mb-4">
                                        <h3 className="settingsProfileCardTitle">Business details</h3>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Website URL</label>
                                        <input 
                                            type="url" 
                                            className="form-control" 
                                            value={profileData.website}
                                            onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                                            placeholder="https://yourwebsite.com"
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Company Name</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={profileData.companyInfo}
                                            onChange={(e) => setProfileData({...profileData, companyInfo: e.target.value})}
                                            placeholder="Your Company Name"
                                        />
                                    </div>

                                    <div className="col-12 mb-3">
                                        <label className="form-label fw-bold">Store Description</label>
                                        <textarea 
                                            className="form-control" 
                                            rows="4"
                                            value={profileData.description}
                                            onChange={(e) => setProfileData({...profileData, description: e.target.value})}
                                            placeholder="Tell customers about your store..."
                                        ></textarea>
                                    </div>

                                    <div className="col-12 mb-3">
                                        <label className="form-label fw-bold">Company introduction (public profile)</label>
                                        <textarea 
                                            className="form-control" 
                                            rows="5"
                                            value={profileData.companyIntroduction}
                                            onChange={(e) => setProfileData({...profileData, companyIntroduction: e.target.value})}
                                            placeholder="Long introduction shown on your storefront company tab..."
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Business type</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={profileData.businessType}
                                            onChange={(e) => setProfileData({...profileData, businessType: e.target.value})}
                                            placeholder="e.g. Custom Manufacturer"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Country / region</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={profileData.countryRegion}
                                            onChange={(e) => setProfileData({...profileData, countryRegion: e.target.value})}
                                            placeholder="e.g. Jiangsu, China"
                                        />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label fw-bold">Years in industry</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={profileData.yearsInIndustry}
                                            onChange={(e) => setProfileData({...profileData, yearsInIndustry: e.target.value})}
                                            placeholder="e.g. 5"
                                        />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label fw-bold">Cooperated suppliers</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={profileData.cooperatedSuppliers}
                                            onChange={(e) => setProfileData({...profileData, cooperatedSuppliers: e.target.value})}
                                            placeholder="e.g. 80"
                                        />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label fw-bold">Year established</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={profileData.yearEstablished}
                                            onChange={(e) => setProfileData({...profileData, yearEstablished: e.target.value})}
                                            placeholder="e.g. 2020"
                                        />
                                    </div>
                                    <div className="col-12 mb-3">
                                        <label className="form-label fw-bold">Main categories</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={profileData.mainCategories}
                                            onChange={(e) => setProfileData({...profileData, mainCategories: e.target.value})}
                                            placeholder="e.g. dental, industrial molds, aerospace"
                                        />
                                    </div>
                                    <div className="col-12 mb-3">
                                        <label className="form-label fw-bold">Main markets (one per line)</label>
                                        <textarea 
                                            className="form-control" 
                                            rows="3"
                                            value={(profileData.mainMarkets || []).join('\n')}
                                            onChange={(e) => setProfileData({
                                                ...profileData,
                                                mainMarkets: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean)
                                            })}
                                            placeholder={'Domestic Market\nSouth Asia'}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Employees</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={profileData.employeesRange}
                                            onChange={(e) => setProfileData({...profileData, employeesRange: e.target.value})}
                                            placeholder="e.g. 101 - 200"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Factory / office size</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={profileData.factorySizeRange}
                                            onChange={(e) => setProfileData({...profileData, factorySizeRange: e.target.value})}
                                            placeholder="e.g. 1,000-3,000 sqm"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Annual output value</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={profileData.annualOutputRange}
                                            onChange={(e) => setProfileData({...profileData, annualOutputRange: e.target.value})}
                                            placeholder="e.g. US$10M - US$50M"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Annual revenue note</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={profileData.annualRevenueNote}
                                            onChange={(e) => setProfileData({...profileData, annualRevenueNote: e.target.value})}
                                            placeholder="e.g. Confidential"
                                        />
                                    </div>
                                    <div className="col-12 mb-3">
                                        <label className="form-label fw-bold">Exhibitions / trade shows</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={profileData.exhibitionsNote}
                                            onChange={(e) => setProfileData({...profileData, exhibitionsNote: e.target.value})}
                                            placeholder="e.g. 3 exhibitions"
                                        />
                                    </div>
                                    <div className="col-12 mb-3">
                                        <label className="form-label fw-bold">Verification badge</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={(profileData.verificationTags || []).join(', ') || 'Not included on your current plan'}
                                            readOnly
                                            disabled
                                        />
                                        <p className="form-text small mb-0">
                                            Verified vendor badge is included on Plus, Pro, and Premium plans and appears on your store and products automatically.
                                        </p>
                                    </div>
                                    <div className="col-12 mb-3">
                                        <label className="form-label fw-bold">Company highlights (one per line)</label>
                                        <textarea 
                                            className="form-control" 
                                            rows="4"
                                            value={(profileData.companyHighlights || []).join('\n')}
                                            onChange={(e) => setProfileData({
                                                ...profileData,
                                                companyHighlights: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean)
                                            })}
                                            placeholder={'Strong R&D\nFull customization'}
                                        />
                                    </div>
                                    <div className="col-12 mb-3 d-flex flex-wrap gap-3">
                                        <label className="form-check-label d-flex align-items-center gap-2">
                                            <input 
                                                type="checkbox" 
                                                className="form-check-input"
                                                checked={profileData.designCustomization}
                                                onChange={(e) => setProfileData({...profileData, designCustomization: e.target.checked})}
                                            />
                                            Design-based customization
                                        </label>
                                        <label className="form-check-label d-flex align-items-center gap-2">
                                            <input 
                                                type="checkbox" 
                                                className="form-check-input"
                                                checked={profileData.fullCustomization}
                                                onChange={(e) => setProfileData({...profileData, fullCustomization: e.target.checked})}
                                            />
                                            Full customization
                                        </label>
                                    </div>

                                    <div className="col-12 mb-4">
                                        <h3 className="settingsProfileCardTitle">Certificates</h3>
                                        <label className="form-label fw-bold">Certificate images (max {MAX_STORE_CERTIFICATES})</label>
                                        <p className="small text-muted mb-2">
                                            {(profileData.certificateImages || []).length} saved
                                            {pendingCerts.length > 0 ? ` · ${pendingCerts.length} new (upload on save)` : ''}
                                            {' · '}
                                            {slotsForCerts()} slot(s) left
                                        </p>
                                        <div className="vendorPreviewGrid mb-3">
                                            {(profileData.certificateImages || []).map((src, i) => (
                                                <div key={`saved-${i}`} className="vendorPreviewTile">
                                                    <img src={`${ServerId}${src}`} alt="" />
                                                    <span className="vendorPreviewLabel">Saved</span>
                                                    <button
                                                        type="button"
                                                        className="vendorPreviewRemove"
                                                        title="Remove from profile"
                                                        onClick={() => setProfileData({
                                                            ...profileData,
                                                            certificateImages: profileData.certificateImages.filter((_, j) => j !== i)
                                                        })}
                                                    >
                                                        <i className="fa-solid fa-xmark" aria-hidden></i>
                                                    </button>
                                                </div>
                                            ))}
                                            {pendingCerts.map((c) => (
                                                <div key={c.id} className="vendorPreviewTile">
                                                    <img src={c.url} alt="" />
                                                    <span className="vendorPreviewLabel">New</span>
                                                    <button
                                                        type="button"
                                                        className="vendorPreviewRemove"
                                                        title="Remove"
                                                        onClick={() => removePendingCert(c.id)}
                                                    >
                                                        <i className="fa-solid fa-xmark" aria-hidden></i>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <label
                                            className={`vendorDropZone d-block ${slotsForCerts() <= 0 ? 'opacity-50 pe-none' : ''}`}
                                            aria-disabled={slotsForCerts() <= 0}
                                        >
                                            <input
                                                type="file"
                                                className="d-none"
                                                accept="image/*"
                                                multiple
                                                disabled={slotsForCerts() <= 0}
                                                onChange={(e) => {
                                                    addPendingCertificates(e.target.files)
                                                    e.target.value = ''
                                                }}
                                            />
                                            <p className="vendorDropZoneTitle mb-1"><i className="fa-solid fa-certificate me-2" aria-hidden></i>Add certificates</p>
                                            <p className="vendorDropZoneHint">Select one or many · recommended ~800×1100px (portrait) or A4 ratio</p>
                                        </label>
                                        <span className="vendorDimHint">
                                            {slotsForCerts() <= 0
                                                ? 'Maximum reached — remove a saved or pending image to add more.'
                                                : 'ISO, compliance scans, awards — previews update as you pick files.'}
                                        </span>
                                    </div>

                                    <div className="col-12 mb-2">
                                        <h3 className="settingsProfileCardTitle">Social links</h3>
                                    </div>

                                    <div className="col-md-6 mb-2">
                                        <div className="input-group">
                                            <span className="input-group-text"><i className="fa-brands fa-facebook"></i></span>
                                            <input 
                                                type="url" 
                                                className="form-control" 
                                                placeholder="Facebook URL"
                                                value={profileData.socialLinks?.facebook || ''}
                                                onChange={(e) => setProfileData({
                                                    ...profileData, 
                                                    socialLinks: {...profileData.socialLinks, facebook: e.target.value}
                                                })}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6 mb-2">
                                        <div className="input-group">
                                            <span className="input-group-text"><i className="fa-brands fa-instagram"></i></span>
                                            <input 
                                                type="url" 
                                                className="form-control" 
                                                placeholder="Instagram URL"
                                                value={profileData.socialLinks?.instagram || ''}
                                                onChange={(e) => setProfileData({
                                                    ...profileData, 
                                                    socialLinks: {...profileData.socialLinks, instagram: e.target.value}
                                                })}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6 mb-2">
                                        <div className="input-group">
                                            <span className="input-group-text"><i className="fa-brands fa-twitter"></i></span>
                                            <input 
                                                type="url" 
                                                className="form-control" 
                                                placeholder="Twitter URL"
                                                value={profileData.socialLinks?.twitter || ''}
                                                onChange={(e) => setProfileData({
                                                    ...profileData, 
                                                    socialLinks: {...profileData.socialLinks, twitter: e.target.value}
                                                })}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6 mb-2">
                                        <div className="input-group">
                                            <span className="input-group-text"><i className="fa-brands fa-linkedin"></i></span>
                                            <input 
                                                type="url" 
                                                className="form-control" 
                                                placeholder="LinkedIn URL"
                                                value={profileData.socialLinks?.linkedin || ''}
                                                onChange={(e) => setProfileData({
                                                    ...profileData, 
                                                    socialLinks: {...profileData.socialLinks, linkedin: e.target.value}
                                                })}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-12 mt-3">
                                        <button type="submit" className="vendorBtnPrimary">
                                            Save profile
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Personal Details Tab */}
                    {activeTab === 'details' && (
                        <div>
                            <div className="vendorPageHeader">
                                <h1 className="vendorPageTitle">Personal details</h1>
                                <p className="vendorPageSubtitle">For admin verification only — not shown on your public storefront or to buyers.</p>
                            </div>
                            <div className="settingsProfileCard mb-3" aria-label="address">
                                <h3 className="settingsProfileCardTitle">Registered address</h3>
                                <form>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label small text-muted">Locality</label>
                                            <input className="form-control" type="text" value={venderLogged.locality} disabled readOnly />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small text-muted">PIN code</label>
                                            <input className="form-control" type="text" value={venderLogged.pinCode} disabled readOnly />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small text-muted">Address</label>
                                            <textarea className="form-control" rows={3} value={venderLogged.address} disabled readOnly />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small text-muted">City / district</label>
                                            <input className="form-control" type="text" value={venderLogged.city} disabled readOnly />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small text-muted">State</label>
                                            <input className="form-control" type="text" value={venderLogged.state} disabled readOnly />
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="settingsProfileCard" aria-label="UserDetails">
                                <h3 className="settingsProfileCardTitle">Contact</h3>
                                <form onSubmit={updateUserDetails}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Email</label>
                                            <input
                                                className="form-control"
                                                type="email"
                                                value={formData.email}
                                                onInput={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="Email"
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Mobile (10 digits)</label>
                                            <input
                                                className="form-control"
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={10}
                                                value={formData.number}
                                                onInput={(e) => setFormData({ ...formData, number: e.target.value })}
                                                placeholder="Mobile number"
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">GSTIN</label>
                                            <input
                                                className="form-control"
                                                type="text"
                                                value={formData.gstin}
                                                onInput={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                                                placeholder="Optional GSTIN"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Country</label>
                                            <input
                                                className="form-control"
                                                type="text"
                                                value={formData.country}
                                                onInput={(e) => setFormData({ ...formData, country: e.target.value })}
                                                placeholder="Country"
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">State</label>
                                            <input
                                                className="form-control"
                                                type="text"
                                                value={formData.state}
                                                onInput={(e) => setFormData({ ...formData, state: e.target.value })}
                                                placeholder="State"
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">City</label>
                                            <input
                                                className="form-control"
                                                type="text"
                                                value={formData.city}
                                                onInput={(e) => setFormData({ ...formData, city: e.target.value })}
                                                placeholder="City"
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">PIN / ZIP</label>
                                            <input
                                                className="form-control"
                                                type="text"
                                                value={formData.pinCode}
                                                onInput={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                                                placeholder="Postal code"
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Locality</label>
                                            <input
                                                className="form-control"
                                                type="text"
                                                value={formData.locality}
                                                onInput={(e) => setFormData({ ...formData, locality: e.target.value })}
                                                placeholder="Locality / street"
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Address</label>
                                            <textarea
                                                className="form-control"
                                                rows={2}
                                                value={formData.address}
                                                onInput={(e) => setFormData({ ...formData, address: e.target.value })}
                                                placeholder="Address"
                                                required
                                            />
                                        </div>
                                        <div className="col-12">
                                            <button type="submit" className="vendorBtnPrimary mt-1">Save contact</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Pickup addresses Tab */}
                    {activeTab === 'pickup' && (
                        <div aria-label="pickupAddresses">
                            <div className="vendorPageHeader">
                                <h1 className="vendorPageTitle">Pickup addresses</h1>
                                <p className="vendorPageSubtitle">Warehouses or shops where couriers collect your orders. Select one per product when listing.</p>
                            </div>
                            <div className="settingsProfileCard p-3 p-md-4">
                                <VendorPickupAddresses />
                            </div>
                        </div>
                    )}

                    {/* Bank Account Tab */}
                    {activeTab === 'bank' && (
                        <div aria-label="bankAccount">
                            <div className="vendorPageHeader">
                                <h1 className="vendorPageTitle">Bank account</h1>
                                <p className="vendorPageSubtitle">For admin payouts only — not shown on your public storefront or to buyers.</p>
                            </div>
                            <div className="settingsProfileCard">
                                <form onSubmit={updateBankAccount}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Account holder name</label>
                                            <input
                                                className="form-control"
                                                type="text"
                                                value={formData.bankAccOwner}
                                                onInput={(e) => setFormData({ ...formData, bankAccOwner: e.target.value })}
                                                required
                                                placeholder="Name as per bank"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Bank name</label>
                                            <input
                                                className="form-control"
                                                type="text"
                                                value={formData.bankName}
                                                onInput={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                                required
                                                placeholder="Bank name"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Account number</label>
                                            <input
                                                className="form-control"
                                                type="text"
                                                inputMode="numeric"
                                                value={formData.bankAccNumber}
                                                onInput={(e) => setFormData({ ...formData, bankAccNumber: e.target.value })}
                                                required
                                                placeholder="Account number"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">IFSC</label>
                                            <input
                                                className="form-control"
                                                type="text"
                                                value={formData.bankIFSC}
                                                onInput={(e) => setFormData({ ...formData, bankIFSC: e.target.value })}
                                                required
                                                placeholder="IFSC code"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Branch name</label>
                                            <input
                                                className="form-control"
                                                type="text"
                                                value={formData.bankBranchName}
                                                onInput={(e) => setFormData({ ...formData, bankBranchName: e.target.value })}
                                                required
                                                placeholder="Branch"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Branch phone</label>
                                            <input
                                                className="form-control"
                                                type="text"
                                                inputMode="tel"
                                                value={formData.bankBranchNumber}
                                                onInput={(e) => setFormData({ ...formData, bankBranchNumber: e.target.value })}
                                                required
                                                placeholder="Branch contact"
                                            />
                                        </div>
                                        <div className="col-12">
                                            <button type="submit" className="vendorBtnPrimary mt-1">Save bank details</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    )
}

export default SettingsComp
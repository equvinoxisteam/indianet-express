import Server, { adminCheck, userCheck, vendorCheck } from '@/Config/Server';
import ContentControl from '@/ContentControl/ContentControl';
import '@/styles/global.scss'
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }) {

  let router = useRouter()
  // User
  const [LoginModal, setLoginModal] = useState({
    btn: false,
    active: false,
    member: true,
    forgot: false,
  })

  const [QuickVw, setQuickVw] = useState({
    active: false,
    btn: false,
    product: {}
  })

  const [OrderType, setOrderType] = useState({
    order: false,
    type: '',
    exAction: false,
    exActionData: {
      failed: false,
      success: false
    }
  })

  const [userLogged, setUserLogged] = useState({
    status: false
  })

  const [cartTotal, setCartTotal] = useState(0)
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)

  const refreshHeaderCounts = (userId) => {
    if (!userId) {
      setCartTotal(0)
      setCartCount(0)
      setWishlistCount(0)
      return
    }
    Server.get('/users/getHeaderCounts', { params: { userId } }).then((res) => {
      setCartTotal(res.data?.cartTotal || 0)
      setCartCount(res.data?.cartCount || 0)
      setWishlistCount(res.data?.wishlistCount || 0)
    }).catch(() => {})
  }

  let check = router.pathname.split('/')

  // Vendor

  const [venderLogged, setVendorLogged] = useState({
    status: false
  })

  // Admin

  const [adminLogged, setAdminLogged] = useState({
    status: false
  })

  const [allCategories, setAllCategories] = useState([])
  const [headerCategories, setHeaderCategories] = useState([])

  //Account Manage

  useEffect(() => {
    // Unregister any active service workers left over from PWA build tests
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
          registration.unregister();
        }
      });
    }

    if (check[1] === 'vendor') {
      // Vendor

      let token = localStorage.getItem('vendorToken')
      vendorCheck(token, (data) => {
        setVendorLogged(data)
        if (data.status) {
          if (check[2] === 'login' || check[2] === 'register') {
            document.body.style.background = '#f0f5fa'
            router.push('/vendor/dashboard')
          }
        }
      })
    } else if (check[1] === "admin") {
      // Admin

      let token = localStorage.getItem('adminToken')
      adminCheck(token, (data) => {
        setAdminLogged(data)
        if (data.status) {
          if (check[2] === 'login') {
            document.body.style.background = '#f0f5fa'
            router.push('/admin/dashboard')
          }
        }
      })
    } else {
      // User

      document.body.style.background = 'white'

      let token = localStorage.getItem('token')
      if (token) {
        userCheck(token, (data) => {
          if (data.status) {
            setUserLogged(data)
            refreshHeaderCounts(data._id)
          } else {
            setUserLogged({ status: false })
            localStorage.removeItem('token')
          }
        })
      } else {
        setUserLogged({ status: false })
      }
    }
  }, [router.asPath])

  useEffect(() => {
    // Fetch Categories Only Once
    Server.get('/users/getHeaderCategories').then((res) => {
      setAllCategories(res.data.allCategories)
      setHeaderCategories(res.data.categories)
    }).catch(() => console.log("Category load error"))
  }, [])

  return (
    <>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="apple-mobile-web-app-title" content="Indianet" />
    </Head>
    <ContentControl.Provider value={
      {
        QuickVw, setQuickVw,
        userLogged, setUserLogged,
        LoginModal, setLoginModal,
        cartTotal, setCartTotal,
        cartCount, setCartCount,
        wishlistCount, setWishlistCount,
        refreshHeaderCounts,
        setOrderType, OrderType,
        setVendorLogged, venderLogged,
        setAdminLogged, adminLogged,
        allCategories, setAllCategories,
        headerCategories, setHeaderCategories
      }
    }>
      <Toaster position="top-center" reverseOrder={false} />
      <Component {...pageProps} />
    </ContentControl.Provider>
    </>
  )

}

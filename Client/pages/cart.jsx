import CartComp from "@/Component/User/Cart/CartComp"
import Footer from "@/Component/User/Footer/Footer"
import Header from "@/Component/User/Header/Header"
import LoginError from "@/Component/Error/LoginError"
import Loading from "@/Component/Loading/Loading"
import { userAxios } from "@/Config/Server"
import ContentControl from "@/ContentControl/ContentControl"
import Head from "next/head"
import { Fragment, useContext, useEffect, useState } from "react"
import toast from 'react-hot-toast';

function Cart() {
    const { userLogged, setUserLogged,
        setLoginModal, setCartTotal, setOrderType, refreshHeaderCounts
    } = useContext(ContentControl)

    const [loaded, setLoaded] = useState(userLogged.status)
    const [logError, setLogError] = useState(false)
    const [update, setUpdate] = useState(false)

    const [products, setProducts] = useState([])
    const [amount, setAmount] = useState({})

    useEffect(() => {
        const token = localStorage.getItem('token')
        setLogError(false)
        if (token) {
            userAxios((server) => {
                server.get(`/users/getCartItems`).then((res) => {
                    if (res.data.login) {
                        setUserLogged({ status: false })
                        localStorage.removeItem('token')
                        setLogError(true)
                        setLoaded(true)
                        setLoginModal(loginModal => ({
                            ...loginModal,
                            btn: true,
                            member: true,
                            forgot: false,
                            active: true
                        }))
                    } else {
                        setAmount(res.data.amount)
                        setCartTotal(res.data.amount.totalPrice)
                        refreshHeaderCounts(userLogged._id)
                        setProducts(res.data.result)
                        setLoaded(true)
                    }
                }).catch((err) => {
                    console.log(err)
                    toast.error("Sorry for facing error")
                    setLoaded(true)
                })
            })
        } else {
            setLogError(true)
            setLoaded(true)
            setLoginModal(loginModal => ({
                ...loginModal,
                btn: true,
                member: true,
                forgot: false,
                active: true
            }))
        }
    }, [update, userLogged])

    return (
        <Fragment>
            <Head>
                <title>Indianet - Cart</title>
                <meta name="description" content="Indianet — online shopping marketplace" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <main>
                <Header />
                {
                    logError ? <LoginError />
                        : <CartComp
                            setUpdate={setUpdate}
                            products={products}
                            amount={amount}
                            setOrderType={setOrderType}
                        />
                }
                <Footer />
            </main>
        </Fragment>
    )
}

export default Cart
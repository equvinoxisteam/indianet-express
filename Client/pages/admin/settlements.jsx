import Loading from '@/Component/Loading/Loading'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { Fragment, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import ContentControl from '@/ContentControl/ContentControl'

const Header = dynamic(() => import('@/Component/Admin/Header/Header'))
const SettlementsComp = dynamic(() => import('@/Component/Admin/Settlements/SettlementsComp'))

export default function AdminSettlements() {
    const { setAdminLogged } = useContext(ContentControl)
    const [loaded, setLoaded] = useState(false)
    const navigate = useRouter()

    useEffect(() => {
        const token = localStorage.getItem('adminToken')
        if (token) setLoaded(true)
        else navigate.push('/admin/login')
    }, [navigate])

    return (
        <Fragment>
            <Head>
                <title>Indianet Express — Settlements</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <main className="Admin">
                {loaded ? (
                    <>
                        <Header />
                        <SettlementsComp />
                    </>
                ) : <Loading />}
            </main>
        </Fragment>
    )
}

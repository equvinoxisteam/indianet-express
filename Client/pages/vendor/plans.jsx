import { useEffect } from 'react'
import { useRouter } from 'next/router'

/** Seller plans removed for Indianet Express — free selling on approval. */
export default function VendorPlansRedirect() {
    const router = useRouter()
    useEffect(() => {
        router.replace('/vendor/dashboard')
    }, [router])
    return null
}

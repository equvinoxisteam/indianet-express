import { useEffect } from 'react'
import { useRouter } from 'next/router'

/** Public pricing removed — sellers register free on Indianet Express. */
export default function Pricing() {
    const router = useRouter()
    useEffect(() => {
        router.replace('/vendor/register')
    }, [router])
    return null
}

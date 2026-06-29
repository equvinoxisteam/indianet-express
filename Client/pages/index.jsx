import Footer from '@/Component/User/Footer/Footer'
import Header from '@/Component/User/Header/Header'
import HomePost from '@/Component/User/HomePost/HomePost'
import QuickView from '@/Component/User/QuickView/QuickView'
import Slider from '@/Component/User/Slider/Slider'
import Server from '@/Config/Server'
import { BRAND_NAME, BRAND_TAGLINE } from '@/Config/brand'
import ContentControl from '@/ContentControl/ContentControl'
import Head from 'next/head'
import { Fragment, useContext, useState } from 'react'

/** API returns null for sliders/banner when unset; components expect { items, for } and banner { file, link }. */
function normalizeHomeLayout(raw) {
  const d = raw || {}
  const emptySection = { title: '', subTitle: '', items: [], items2: [] }
  const emptySlider = { items: [], for: 'product' }

  const coalesceSlider = (s) => {
    if (s && typeof s === 'object' && !Array.isArray(s)) {
      return {
        ...emptySlider,
        ...s,
        for: s.for || emptySlider.for,
        items: Array.isArray(s.items) ? s.items : [],
      }
    }
    return { ...emptySlider }
  }

  const coalesceSection = (key) => {
    const s = d[key]
    if (s && typeof s === 'object' && Array.isArray(s.items)) {
      return {
        title: s.title || '',
        subTitle: s.subTitle || '',
        items: s.items,
        items2: Array.isArray(s.items2) ? s.items2 : [],
      }
    }
    return { ...emptySection }
  }

  let banner = d.banner
  if (!banner || typeof banner !== 'object' || Array.isArray(banner)) {
    banner = { file: { filename: '' }, link: '' }
  } else if (!banner.file || typeof banner.file !== 'object') {
    banner = { ...banner, file: { filename: '' } }
  }

  return {
    ...d,
    sliderOne: coalesceSlider(d.sliderOne),
    sliderTwo: coalesceSlider(d.sliderTwo),
    banner,
    sectionone: coalesceSection('sectionone'),
    sectiontwo: coalesceSection('sectiontwo'),
    sectionthree: coalesceSection('sectionthree'),
    sectionfour: coalesceSection('sectionfour'),
  }
}

export async function getServerSideProps() {
  try {
    const [layoutRes, shopRes] = await Promise.all([
      Server.get('/users/getLayouts'),
      Server.get('/users/shopCategories').catch(() => ({ data: [] })),
    ])
    return {
      props: {
        response: normalizeHomeLayout(layoutRes.data),
        shopCategories: Array.isArray(shopRes.data) ? shopRes.data : [],
        layoutLoadError: null,
      },
    }
  } catch (err) {
    console.error('[index] getLayouts failed:', err?.message || err)
    return {
      props: {
        response: normalizeHomeLayout(null),
        shopCategories: [],
        layoutLoadError:
          process.env.NODE_ENV === 'development'
            ? 'Home layout API failed (is SERVER running and Client/.env.local ServerUrl correct?).'
            : 'We could not load featured content. Please refresh in a moment.',
      },
    }
  }
}

export default function Home({ response, shopCategories, layoutLoadError }) {
  const { QuickVw } = useContext(ContentControl)

  const [layout] = useState(response)
  return (
    <Fragment>
      <Head>
        <title>{BRAND_NAME} — Shop Online</title>
        <meta name="description" content={BRAND_TAGLINE} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <Header />
        {layoutLoadError && (
          <div className="container py-3">
            <div className="alert alert-warning mb-0" role="alert">
              {layoutLoadError}
            </div>
          </div>
        )}
        {QuickVw.active && <QuickView />}
        <Slider layout={layout} />
        <HomePost layout={layout} shopCategories={shopCategories} />
        <Footer />
      </main>
    </Fragment>
  )
}

import Link from 'next/link'
import { BRAND_NAME } from '@/Config/brand'

/**
 * Indianet Express wordmark for headers and auth screens.
 * @param {'default' | 'light'} variant - light: white text on blue/dark bars
 */
export default function BrandLogo({ href = '/', variant = 'default', className = '' }) {
  const isLight = variant === 'light'
  const Tag = href ? Link : 'div'
  return (
    <Tag
      href={href || undefined}
      className={`LinkTagNonDec d-inline-flex align-items-center gap-2 ${className}`}
      style={{ textDecoration: 'none' }}
    >
      <img
        src="/logo_bg.jpg"
        alt={BRAND_NAME}
        width={40}
        height={40}
        style={{ objectFit: 'contain', borderRadius: 8, flexShrink: 0 }}
        className="brand-logo-img"
      />
      <span
        className={`brand-logo-text ${isLight ? '' : 'UserGreenMain'}`}
        style={{
          fontWeight: 700,
          fontSize: 'clamp(1rem, 3vw, 1.2rem)',
          margin: 0,
          color: isLight ? '#ffffff' : undefined,
          whiteSpace: 'nowrap',
        }}
      >
        {BRAND_NAME}
      </span>
    </Tag>
  )
}

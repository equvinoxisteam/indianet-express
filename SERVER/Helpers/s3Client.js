import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export function isS3Enabled() {
    return !!(
        process.env.AWS_S3_BUCKET &&
        process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY
    )
}

/** Optional folder inside the bucket, e.g. indianet-express-equvinoxis */
export function getS3KeyPrefix() {
    return String(process.env.S3_KEY_PREFIX || '').replace(/^\/+|\/+$/g, '')
}

export function prefixS3Key(key) {
    const normalizedKey = String(key).replace(/^\//, '')
    const prefix = getS3KeyPrefix()
    return prefix ? `${prefix}/${normalizedKey}` : normalizedKey
}

let client = null

export function getS3Client() {
    if (!client) {
        client = new S3Client({
            region: process.env.AWS_REGION || 'ap-south-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        })
    }
    return client
}

export async function uploadToS3({ key, body, contentType }) {
    const fullKey = prefixS3Key(key)
    await getS3Client().send(new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fullKey,
        Body: body,
        ContentType: contentType || 'application/octet-stream',
    }))
    return fullKey
}

/** Public base URL for product/vendor images (used as ServerId in production when on S3). */
export function getPublicFileBaseUrl() {
    const base = (() => {
        if (process.env.S3_PUBLIC_URL) {
            return process.env.S3_PUBLIC_URL.replace(/\/$/, '')
        }
        if (isS3Enabled()) {
            const region = process.env.AWS_REGION || 'ap-south-1'
            return `https://${process.env.AWS_S3_BUCKET}.s3.${region}.amazonaws.com`
        }
        return null
    })()
    if (!base) return null

    const prefix = getS3KeyPrefix()
    if (!prefix) return base
  // If S3_PUBLIC_URL already ends with the prefix path, do not duplicate it.
    if (base.endsWith(`/${prefix}`) || base.endsWith(prefix)) return base
    return `${base}/${prefix}`
}

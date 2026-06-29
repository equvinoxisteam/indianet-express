# Railway deploy — Indianet Express

## Services

Create **two** Railway services from this repo:

| Service | Root directory | Start command |
|---------|----------------|---------------|
| **API** | `SERVER` | `npm start` |
| **Web** | `Client` | `npm run build && npm start` |

## Custom domains (GoDaddy / DNS)

| Host | Points to |
|------|-----------|
| `www.indianetexpress.equvinoxis.com` | Client service |
| `indianetexpress.equvinoxis.com` | Client service (optional redirect) |
| `api.indianetexpress.equvinoxis.com` | API service |

## SERVER environment variables

Copy into Railway → API service → Variables. **Do not commit real values to git.**

```
PORT=5000
DB_URL=<your MongoDB Atlas URI>
DB_NAME=indianet-express
JWT_SECRET=<long random string>
CLIENT_URL=https://www.indianetexpress.equvinoxis.com
CORS_ORIGINS=https://www.indianetexpress.equvinoxis.com,https://indianetexpress.equvinoxis.com
SUPPORT_EMAIL=team@equvinoxis.com
MAIL_PROVIDER=gmail
GMAIL_CLIENT_ID=<from Google Cloud>
GMAIL_CLIENT_SECRET=<from Google Cloud>
GMAIL_REFRESH_TOKEN=<from OAuth playground>
GMAIL_USER=info@equvinoxis.com
GMAIL_REDIRECT_URI=https://developers.google.com/oauthplayground
MAIL_FROM=Indianet Express <info@equvinoxis.com>
ADMIN_MAIL=team@equvinoxis.com
ADMIN_EMAIL=team@equvinoxis.com
ADMIN_PASSWORD=<strong admin password>
RAZORPAY_ID=<razorpay key id>
RAZORPAY_SECREt=<razorpay secret>
SHIPROCKET_EMAIL=<shiprocket login>
SHIPROCKET_PASS=<shiprocket password>
AWS_ACCESS_KEY_ID=<aws key>
AWS_SECRET_ACCESS_KEY=<aws secret>
AWS_REGION=eu-north-1
AWS_S3_BUCKET=indianet-equvinoxis
S3_PUBLIC_URL=https://indianet-equvinoxis.s3.eu-north-1.amazonaws.com
S3_KEY_PREFIX=indianet-express-equvinoxis
```

Optional WhatsApp (Twilio):

```
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

## CLIENT environment variables

Railway → Web service → Variables:

```
ServerUrl=https://api.indianetexpress.equvinoxis.com/api
ServerId=https://indianet-equvinoxis.s3.eu-north-1.amazonaws.com/indianet-express-equvinoxis
```

## AWS S3 bucket

1. Use existing bucket **`indianet-equvinoxis`** in `eu-north-1`
2. Optional folder prefix: `S3_KEY_PREFIX=indianet-express-equvinoxis`
3. Enable public read on objects (bucket policy)
4. Set `AWS_*`, `S3_PUBLIC_URL`, `S3_KEY_PREFIX` on API; `ServerId` on Client must match public URL + prefix

## MongoDB

Use database name **`indianet-express`** (`DB_NAME`). Collections are created on first use.

## Post-deploy checks

1. `https://api.indianetexpress.equvinoxis.com/health` → `{ ok: true }`
2. Homepage loads at `https://www.indianetexpress.equvinoxis.com`
3. Admin login at `/admin/login`
4. Vendor registers, adds product with price, buyer checkout test

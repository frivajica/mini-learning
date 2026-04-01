# File Storage Guide

Understanding file storage patterns in Payload CMS - from local development to cloud production.

---

## Table of Contents

1. [Overview](#overview)
2. [Local Storage (Development)](#local-storage-development)
3. [S3-Compatible Storage (Production)](#s3-compatible-storage-production)
4. [Image Processing](#image-processing)
5. [Security Considerations](#security-considerations)
6. [Migration Guide](#migration-guide)

---

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Storage Options                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────┐          ┌─────────────┐          ┌─────────┐ │
│   │    Local    │          │     S3      │          │  Cloud  │ │
│   │  Filesystem │          │  (AWS/Mino) │          │ inary  │ │
│   └──────┬──────┘          └──────┬──────┘          └────┬────┘ │
│          │                        │                       │      │
│   ✅ Zero setup             ✅ Scalable              ✅ Managed   │
│   ✅ Fast for dev           ✅ Persistent            ✅ CDN       │
│   ❌ Not production         ✅ S3-compatible        ❌ Vendor    │
│                               ❌ Setup required     ❌ Costly    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Local Storage (Development)

### Configuration

```typescript
// payload.config.ts
const media = {
  slug: "media",
  upload: {
    staticDir: "uploads", // Relative to project root
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        position: "centre",
      },
      {
        name: "card",
        width: 768,
        height: 512,
        position: "centre",
      },
    ],
    adminThumbnail: "thumbnail",
    mimeTypes: ["image/*", "application/pdf"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      label: "Alt Text",
    },
  ],
};
```

### File Organization

```
project/
├── uploads/
│   ├── thumbnail/
│   │   └── abc123-thumbnail.jpg
│   ├── card/
│   │   └── abc123-card.jpg
│   └── original/
│       └── abc123.jpg
├── src/
└── payload.config.ts
```

### Serving Local Files

Next.js needs to serve these files:

```typescript
// next.config.ts
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/uploads/**",
      },
    ],
  },
};
```

**Note:** For production, use a cloud storage or configure Next.js to serve static files from `uploads/`.

---

## S3-Compatible Storage (Production)

### Why S3?

- **Durability**: 99.999999999% (11 9's)
- **Scalability**: Handle any traffic spike
- **Cost**: Pay only for what you use
- **CDN**: Easy integration with CloudFront/Cloudflare

### Supported Providers

| Provider        | S3 Compatible | Notes                     |
| --------------- | ------------- | ------------------------- |
| AWS S3          | ✅ Native     | Most popular              |
| MinIO           | ✅ Native     | Self-hosted, dev-friendly |
| DigitalOcean    | ✅ Native     | Spaces object storage     |
| R2 (Cloudflare) | ✅ Native     | No egress fees            |
| Backblaze B2    | ✅ Native     | Low cost                  |

### Configuration

```typescript
// payload.config.ts
import { s3Adapter } from "@payloadcms/storage-s3";

const media = {
  slug: "media",
  upload: {
    adapter: s3Adapter({
      bucket: process.env.S3_BUCKET,
      config: {
        region: process.env.S3_REGION,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        },
      },
    }),
  },
};
```

### Environment Variables

```bash
# AWS S3
S3_BUCKET=my-payload-bucket
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=AKIA...
S3_SECRET_ACCESS_KEY=...

# Or use S3-compatible endpoint (MinIO, R2, etc.)
S3_ENDPOINT=https://your-minio-server:9000
```

### Complete S3 Configuration

```typescript
import { s3Adapter } from "@payloadcms/storage-s3";

export default buildConfig({
  // ...
  plugins: [
    s3Adapter({
      bucket: process.env.S3_BUCKET!,
      config: {
        region: process.env.S3_REGION || "us-east-1",
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
        // Optional: S3-compatible endpoint
        ...(process.env.S3_ENDPOINT && {
          endpoint: process.env.S3_ENDPOINT,
          forcePathStyle: true, // Required for MinIO
        }),
      },
      collections: {
        media: {
          prefix: "media/", // Store under prefix
        },
      },
    }),
  ],
});
```

---

## Image Processing

### Payload Image Sizes

Payload automatically generates image sizes on upload:

```typescript
upload: {
  imageSizes: [
    { name: "thumbnail", width: 400, height: 300 },
    { name: "card", width: 768, height: 512 },
    { name: "og", width: 1200, height: 630 }, // Open Graph
  ],
},
```

### Using Different Sizes

```typescript
// In your component
const { featuredImage } = post;

// Original
<img src={featuredImage.url} alt={featuredImage.alt} />

// Thumbnail
<img
  src={`${featuredImage.url}?width=400`}
  alt={featuredImage.alt}
/>

// Specific size (if generated)
<img
  src={featuredImage.sizes?.card?.url}
  alt={featuredImage.alt}
/>
```

### Sharp Configuration

Payload uses Sharp for image processing. Configure in `package.json`:

```json
{
  "dependencies": {
    "sharp": "^0.33.0"
  },
  "payload": {
    "sharp": {
      "quality": 80,
      "compressionLevel": 9
    }
  }
}
```

---

## Security Considerations

### 1. Validate File Types

```typescript
upload: {
  mimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  // Or use glob patterns:
  mimeTypes: ["image/*", "application/pdf"],
},
```

### 2. Limit File Size

```typescript
upload: {
  maxFileSize: 5_000_000, // 5MB in bytes
},
```

### 3. Protect Upload Endpoints

```typescript
access: {
  create: ({ req: { user } }) => Boolean(user), // Require auth
  delete: ({ req: { user } }) => user?.role === "admin", // Admin only
},
```

### 4. Scan Uploads for Malware

For production, integrate virus scanning:

- Use AWS S3 bucket policies with Macie
- Or use a third-party scanning service (ClamAV, VirusTotal API)

### 5. Generate Safe Filenames

```typescript
hooks: {
  beforeChange: [
    ({ data, operation }) => {
      if (operation === "create") {
        // Generate unique, safe filename
        const ext = data.filename?.split(".").pop();
        data.filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      }
      return data;
    },
  ],
},
```

---

## Migration Guide

### Local to S3

1. **Configure S3 adapter** (see above)

2. **Upload existing files to S3**

   ```bash
   aws s3 sync ./uploads s3://your-bucket/media/
   ```

3. **Update Payload config** to use S3 adapter

4. **Test thoroughly** - verify all images load

5. **Remove local files** after confirming S3 works

### S3 to Different Provider

1. **Update environment variables**:

   ```bash
   # Keep same bucket, change credentials
   S3_BUCKET=my-payload-bucket
   S3_ACCESS_KEY_ID=new-provider-key
   S3_SECRET_ACCESS_KEY=new-provider-secret
   S3_REGION=new-provider-region
   S3_ENDPOINT=new-provider-endpoint # If needed
   ```

2. **Test the connection**

### Database Considerations

Payload stores file URLs in the database. Migration doesn't require database changes if you use the same S3-compatible endpoint structure.

---

## See Also

- [Payload Upload Documentation](https://payloadcms.com/docs/upload/overview)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [LEARN.md](LEARN.md)

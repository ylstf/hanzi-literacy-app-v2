# Deployment Guide

This app is a static website. It has no backend and does not upload user data. A deployment only needs these files:

- `index.html`
- `styles.css`
- `app.js`
- `data/hanzi.js`

User records are saved in each visitor's browser local storage. If a family changes devices or clears browser storage, records may be lost.

## Recommended Choice

For early public testing, use Tencent EdgeOne Pages or another static hosting service first. It is the simplest path because the app is static and does not need a server.

If the site will be promoted seriously to families in mainland China with a custom domain, plan for ICP filing before using mainland China hosting, mainland China CDN, or a mainland China object storage bucket.

## ICP Filing Basics

- Mainland China hosting or mainland China CDN generally requires ICP filing for the domain.
- Hong Kong and overseas hosting generally do not require ICP filing, but mainland China access may be slower or less stable.
- ICP filing is handled through the actual access provider. If the site is hosted on Alibaba Cloud mainland China resources, file through Alibaba Cloud. If hosted on Tencent Cloud mainland China resources, file through Tencent Cloud.
- After ICP filing succeeds, the ICP number should be shown in the website footer and link to the MIIT filing site.
- A website opened to the public in mainland China may also need public security filing within 30 days after launch.

Typical filing time:

- Tencent Cloud says its initial review is usually about 1-2 working days, and the provincial communications administration review is no more than 20 working days.
- Alibaba Cloud says the provincial communications administration review is generally 1-20 working days.

## Tencent Cloud Path

### Option A: EdgeOne Pages

Best for quick static deployment.

Steps:

1. Push this project to a Git repository.
2. Open EdgeOne Pages.
3. Connect the repository.
4. Use the project root as the deploy directory.
5. No build command is needed.
6. Deploy and test the temporary URL.
7. If using a custom domain with mainland China acceleration, complete ICP filing first or follow EdgeOne/Tencent requirements.

Estimated time:

- Temporary URL: about 10-30 minutes after the repository is ready.
- Custom domain without filing requirements: about 30-60 minutes, mostly DNS waiting time.
- Mainland China custom domain with ICP filing: usually several working days to a few weeks.

Estimated cost:

- EdgeOne Pages currently has a free entry path for normal small static sites.
- A domain usually costs about tens of CNY per year.
- ICP filing itself is usually free, but you may need an eligible mainland China cloud resource or filing authorization resource.
- For Tencent Cloud filing with CVM or Lighthouse, the mainland China instance usually needs to be subscription-based for 3 months or more and have a public IP with non-zero bandwidth.

### Option B: COS Static Website

Best when you want classic object-storage hosting.

Steps:

1. Create a COS bucket.
2. Upload `index.html`, `styles.css`, `app.js`, and the `data/` folder.
3. Enable static website hosting.
4. Set index document to `index.html`.
5. Bind a custom domain if needed.
6. If the bucket or CDN uses mainland China resources, finish ICP filing before public custom-domain access.
7. Add HTTPS certificate and CDN only after the domain/filing path is clear.

Estimated cost:

- Storage cost is tiny for this project because the files are small.
- Main cost is outbound traffic if many users visit.
- For early testing, expect roughly 0-50 CNY/month unless traffic grows significantly.

## Alibaba Cloud Path

### Option A: OSS Static Website

Best Alibaba Cloud equivalent of static hosting.

Steps:

1. Create an OSS bucket.
2. Upload `index.html`, `styles.css`, `app.js`, and the `data/` folder.
3. Enable static website hosting.
4. Set default homepage to `index.html`.
5. Bind a custom domain. Alibaba Cloud notes that normal browser viewing through OSS static hosting needs a custom domain.
6. If the bucket is in mainland China, complete ICP filing for the domain before binding/public access.
7. Add HTTPS certificate and CDN if needed.

Estimated cost:

- OSS storage is very cheap for this project; Alibaba Cloud pricing includes storage, outbound traffic, and request fees.
- For early testing, expect roughly 0-50 CNY/month unless traffic grows.
- Traffic cost matters more than storage cost.

### Option B: ECS Server

Not recommended for this app unless you later add a backend.

Why:

- This app is static.
- ECS adds server maintenance, security updates, Nginx configuration, and higher baseline cost.

Estimated cost:

- Usually higher than static hosting, often tens of CNY/month or more depending on instance and bandwidth.

## Launch Checklist

Before sharing publicly:

1. Decide hosting region: mainland China vs Hong Kong/overseas.
2. Decide domain name.
3. If using mainland China resources, start ICP filing early.
4. Upload/deploy static files.
5. Test on iPhone, Android, and desktop.
6. Confirm local storage warning is visible.
7. Confirm report QR code points to the final public URL.
8. If ICP filing is completed, add the ICP number to the footer.
9. If required, complete public security filing after launch.

## Practical Recommendation

For this project, start with Tencent EdgeOne Pages for testing. After user feedback is stable, decide whether to:

- Keep a no/low-cost static hosting setup for small-scale sharing.
- Move to mainland China resources with ICP filing for better domestic access and formal promotion.
- Add a backend later only if you need cross-device accounts, server-side reports, or centralized data.

## Official References

- Tencent Cloud ICP filing first filing: https://cloud.tencent.com/document/product/243/97668
- Tencent Cloud ICP filing cloud resource requirements: https://cloud.tencent.com/document/product/243/18908
- Tencent Cloud ICP filing review time: https://cloud.tencent.com/document/product/243/19650
- EdgeOne Pages domain management: https://pages.edgeone.ai/zh/document/domain-overview
- EdgeOne Pages pricing: https://pages.edgeone.ai/zh/pricing
- Alibaba Cloud OSS static website hosting: https://help.aliyun.com/zh/oss/user-guide/hosting-static-websites
- Alibaba Cloud OSS and ICP filing: https://help.aliyun.com/zh/icp-filing/basic-icp-service/product-overview/use-oss
- Alibaba Cloud ICP filing review time: https://help.aliyun.com/zh/icp-filing/basic-icp-service/user-guide/administration-review/

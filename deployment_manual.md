# Avani Loan Service: Deployment Reference Manual

This document contains key information for managing the hosting and automated updates for the Avani Loan Service platform.

## 1. Hosting & Automation Details
- **Provider**: Vercel (Production)
- **Live Preview URL**: [avani-loan-service-fy-26-27.vercel.app](https://avani-loan-service-fy-26-27.vercel.app)
- **Automation Method**: GitHub CI/CD (Linked to repository)
- **Vercel Project Name**: `avani-loan-service-fy-26-27`
- **GitHub Repository**: `avaniagrofoods/avani-loan-services`

## 2. 'Auto Mode' (GitHub Sync)
The project is configured for **Auto Mode**. Every time you push changes to the GitHub repository:
1. Vercel automatically detects the update.
2. A new production build is generated.
3. The live site is updated within minutes.

### Manual Command Sync
If you need to push updates manually from your local machine, navigate to this folder and use:
```powershell
npx vercel --prod
```

## 3. Professional Domain (Optional)
Currently, your site is on a Vercel subdomain. To link a professional domain (e.g., `loans.avaniagrofoods.com`), you can add the domain in the Vercel Dashboard settings. Use the following DNS settings in Hostinger:

| Type | Name | Value | 
| :--- | :--- | :--- | 
| **CNAME** | loans | `cname.vercel-dns.com` |

## 4. Branding & Contact
- **Standardized Email**: `sales@avaniagrofoods.com`
- **Branding Verification**: Footer, Contact Page, and Privacy Policy have been updated for a professional business presentation.

# Avani Loan Service - Auto Deployment Script
# This script automates the build and production deployment to Vercel.

Write-Host "🚀 Starting Auto Deployment for Avani Loan Services..." -ForegroundColor Cyan

# 1. Check if Vercel is logged in
$whoami = npx vercel whoami 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Vercel token is invalid or expired." -ForegroundColor Red
    Write-Host "💡 Resolution: Please run 'npx vercel login' or visit the following URL to authenticate:" -ForegroundColor Yellow
    Write-Host "🔗 https://vercel.com/oauth/device" -ForegroundColor Blue
    exit 1
}

Write-Host "✅ Authenticated as: $whoami" -ForegroundColor Green

# 2. Run Build
Write-Host "📦 Building project..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Please check for errors in the console." -ForegroundColor Red
    exit 1
}

# 3. Deploy to Production
Write-Host "🚀 Deploying to Vercel Production..." -ForegroundColor Cyan
npx vercel deploy --prod --yes
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed." -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Deployment Successful!" -ForegroundColor Green
Write-Host "🌐 Live URL: https://avani-loan-service-fy-26-27.vercel.app" -ForegroundColor Blue

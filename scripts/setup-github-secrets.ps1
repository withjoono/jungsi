# GitHub Actions Secrets 자동 설정 스크립트 (PowerShell)
# 
# 사용법: .\scripts\setup-github-secrets.ps1

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "GitHub Actions Secrets 설정" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 프로젝트 설정
$PROJECT_ID = "ts-back-nest-479305"
$REPO = "withjoono/jungsi"
$SA_NAME = "github-actions-deploy"
$SA_EMAIL = "$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"

Write-Host "📊 프로젝트 정보:" -ForegroundColor Yellow
Write-Host "   GCP Project: $PROJECT_ID" -ForegroundColor Gray
Write-Host "   GitHub Repo: $REPO" -ForegroundColor Gray
Write-Host "   Service Account: $SA_EMAIL" -ForegroundColor Gray
Write-Host ""

# 입력 받기
$DB_USER = Read-Host "데이터베이스 사용자 (기본값: tsuser)"
if ([string]::IsNullOrWhiteSpace($DB_USER)) { $DB_USER = "tsuser" }

$DB_PASSWORD_Secure = Read-Host "데이터베이스 비밀번호" -AsSecureString
$DB_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD_Secure)
)

$DB_NAME = Read-Host "데이터베이스 이름 (기본값: geobukschool_prod)"
if ([string]::IsNullOrWhiteSpace($DB_NAME)) { $DB_NAME = "geobukschool_prod" }

$API_URL = Read-Host "Cloud Run Service URL (예: https://jungsi-backend-xxxx.run.app)"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "1단계: GCP Service Account 생성" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan

# Service Account 존재 확인
Write-Host "Service Account 확인 중..." -ForegroundColor Yellow
try {
    $saExists = gcloud iam service-accounts describe $SA_EMAIL --project=$PROJECT_ID 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Service Account가 이미 존재합니다" -ForegroundColor Gray
    }
} catch {
    Write-Host "Service Account 생성 중..." -ForegroundColor Yellow
    gcloud iam service-accounts create $SA_NAME --display-name="GitHub Actions Deploy" --project=$PROJECT_ID
    Write-Host "Service Account 생성 완료" -ForegroundColor Green
}

# 권한 부여
Write-Host "🔐 권한 부여 중..." -ForegroundColor Yellow

$roles = @(
    "roles/run.admin",
    "roles/cloudsql.client",
    "roles/storage.admin",
    "roles/iam.serviceAccountUser"
)

foreach ($role in $roles) {
    Write-Host "   → $role" -ForegroundColor Gray
    gcloud projects add-iam-policy-binding $PROJECT_ID `
        --member="serviceAccount:$SA_EMAIL" `
        --role="$role" `
        --quiet 2>&1 | Out-Null
}

Write-Host "✅ 권한 부여 완료" -ForegroundColor Green

# JSON 키 생성
Write-Host "🔑 Service Account 키 생성 중..." -ForegroundColor Yellow
$KEY_FILE = "gcp-sa-key.json"
gcloud iam service-accounts keys create $KEY_FILE `
    --iam-account=$SA_EMAIL `
    --project=$PROJECT_ID
Write-Host "✅ 키 파일 생성: $KEY_FILE" -ForegroundColor Green

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "2단계: Secret Manager에 비밀 저장" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan

Write-Host "💾 Secret Manager에 비밀 저장 중..." -ForegroundColor Yellow

# Secrets 생성 함수
function Create-GCPSecret {
    param($secretName, $secretValue)
    
    $exists = gcloud secrets describe $secretName --project=$PROJECT_ID 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ℹ️  $secretName 이미 존재 (업데이트 건너뜀)" -ForegroundColor Gray
    } else {
        Write-Host "   → $secretName 생성 중..." -ForegroundColor Gray
        $secretValue | gcloud secrets create $secretName --data-file=- --project=$PROJECT_ID 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ $secretName 생성 완료" -ForegroundColor Green
        }
    }
    
    # Service Account에 권한 부여
    gcloud secrets add-iam-policy-binding $secretName `
        --member="serviceAccount:$SA_EMAIL" `
        --role="roles/secretmanager.secretAccessor" `
        --project=$PROJECT_ID `
        --quiet 2>&1 | Out-Null
}

Create-GCPSecret "db-password" $DB_PASSWORD
Create-GCPSecret "db-name" $DB_NAME
Create-GCPSecret "db-user" $DB_USER

# JWT Secret 생성 (랜덤)
$JWT_SECRET = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
Create-GCPSecret "jwt-secret" $JWT_SECRET

Write-Host "✅ Secret Manager 설정 완료" -ForegroundColor Green

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "3단계: GitHub Secrets 설정" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan

Write-Host "📤 GitHub Secrets 업로드 중..." -ForegroundColor Yellow

# GitHub Secrets 설정
Write-Host "   → GCP_SA_KEY" -ForegroundColor Gray
Get-Content $KEY_FILE | gh secret set GCP_SA_KEY --repo=$REPO
Write-Host "   ✅ GCP_SA_KEY 설정 완료" -ForegroundColor Green

Write-Host "   → DB_USER" -ForegroundColor Gray
$DB_USER | gh secret set DB_USER --repo=$REPO
Write-Host "   ✅ DB_USER 설정 완료" -ForegroundColor Green

Write-Host "   → DB_PASSWORD" -ForegroundColor Gray
$DB_PASSWORD | gh secret set DB_PASSWORD --repo=$REPO
Write-Host "   ✅ DB_PASSWORD 설정 완료" -ForegroundColor Green

Write-Host "   → DB_NAME" -ForegroundColor Gray
$DB_NAME | gh secret set DB_NAME --repo=$REPO
Write-Host "   ✅ DB_NAME 설정 완료" -ForegroundColor Green

Write-Host "   → DB_PASSWORD_SECRET_NAME" -ForegroundColor Gray
"db-password" | gh secret set DB_PASSWORD_SECRET_NAME --repo=$REPO
Write-Host "   ✅ DB_PASSWORD_SECRET_NAME 설정 완료" -ForegroundColor Green

Write-Host "   → DB_NAME_SECRET_NAME" -ForegroundColor Gray
"db-name" | gh secret set DB_NAME_SECRET_NAME --repo=$REPO
Write-Host "   ✅ DB_NAME_SECRET_NAME 설정 완료" -ForegroundColor Green

Write-Host "   → DB_USER_SECRET_NAME" -ForegroundColor Gray
"db-user" | gh secret set DB_USER_SECRET_NAME --repo=$REPO
Write-Host "   ✅ DB_USER_SECRET_NAME 설정 완료" -ForegroundColor Green

Write-Host "   → JWT_SECRET_NAME" -ForegroundColor Gray
"jwt-secret" | gh secret set JWT_SECRET_NAME --repo=$REPO
Write-Host "   ✅ JWT_SECRET_NAME 설정 완료" -ForegroundColor Green

Write-Host "   → VITE_API_URL_NEST" -ForegroundColor Gray
$API_URL | gh secret set VITE_API_URL_NEST --repo=$REPO
Write-Host "   ✅ VITE_API_URL_NEST 설정 완료" -ForegroundColor Green

Write-Host "   → VITE_API_URL_SPRING" -ForegroundColor Gray
$API_URL | gh secret set VITE_API_URL_SPRING --repo=$REPO
Write-Host "   ✅ VITE_API_URL_SPRING 설정 완료" -ForegroundColor Green

# 정리
Write-Host ""
Write-Host "🧹 임시 파일 정리..." -ForegroundColor Yellow
Remove-Item -Path $KEY_FILE -Force
Write-Host "✅ 정리 완료" -ForegroundColor Green

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "✅ 설정 완료!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📝 다음 단계:" -ForegroundColor Yellow
Write-Host "1. Firebase Service Account를 수동으로 추가하세요 (선택사항):" -ForegroundColor Gray
Write-Host "   gh secret set FIREBASE_SERVICE_ACCOUNT --repo=$REPO < firebase-service-account.json" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. 코드를 push하면 자동 배포가 시작됩니다:" -ForegroundColor Gray
Write-Host "   git add ." -ForegroundColor Cyan
Write-Host "   git commit -m 'Setup GitHub Actions deployment'" -ForegroundColor Cyan
Write-Host "   git push origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. GitHub Actions 탭에서 배포 상태를 확인하세요:" -ForegroundColor Gray
Write-Host "   https://github.com/$REPO/actions" -ForegroundColor Cyan
Write-Host ""

# 비밀번호 변수 초기화
$DB_PASSWORD = $null
$DB_PASSWORD_Secure = $null

Write-Host "Press Enter to continue..."
$null = Read-Host

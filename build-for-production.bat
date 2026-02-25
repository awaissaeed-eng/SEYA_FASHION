@echo off
echo ========================================
echo   SEYA Fashion - Production Build
echo ========================================
echo.

echo [1/4] Navigating to frontend folder...
cd frontend

echo [2/4] Cleaning old build...
if exist dist rmdir /s /q dist

echo [3/4] Building for production...
echo This may take a few minutes...
call npm run build

echo.
echo [4/4] Build complete!
echo.
echo ========================================
echo   NEXT STEPS:
echo ========================================
echo 1. Upload ALL files from 'frontend/dist/' to Hostinger
echo 2. Upload '.htaccess' file to Hostinger root
echo 3. Ensure backend is running on Hostinger
echo 4. Clear browser cache (Ctrl+Shift+R)
echo 5. Test: https://seyafashion.com.pk
echo ========================================
echo.

pause

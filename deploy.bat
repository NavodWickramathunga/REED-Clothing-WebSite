@echo off
cd /d "%~dp0"
echo ===================================================
echo   REED Clothing Website - Portable Build and Deploy
echo ===================================================
echo.

:: Set local path to the portable Node.js version we downloaded
set PATH=%~dp0node-v20.14.0-win-x64;%PATH%

:: 1. Log in to Firebase
echo [1/3] Checking Firebase login...
echo If a browser window opens, please log in with your Google account.
echo.
call npx -p firebase-tools firebase login
echo.

:: 2. Build the website
echo [2/3] Building the website...
echo.
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed! Please check the error above.
    pause
    exit /b %errorlevel%
)
echo.

:: 3. Deploy to Firebase (Hosting and Firestore Rules)
echo [3/3] Deploying to Firebase Hosting and Database Rules...
echo.
call npx -p firebase-tools firebase deploy --only hosting,firestore,storage --project reed-clothing-website
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Deployment failed! Please check the error above.
    pause
    exit /b %errorlevel%
)

echo.
echo ===================================================
echo   SUCCESS! Your website and database are now updated!
echo ===================================================
echo.
pause

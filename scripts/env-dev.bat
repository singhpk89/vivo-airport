@echo off
REM Switch to Development Environment

echo 🔄 Switching to Development Environment...

REM Copy development environment file
copy .env.development .env > nul

echo ✅ Development environment activated!
echo 📝 API URL: https://lic.test/api
echo 🗄️ Database: SQLite
echo 📧 Mail: Log driver
echo.
echo To start development server, run:
echo npm run dev

pause

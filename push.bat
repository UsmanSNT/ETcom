@echo off
cd /d C:\Users\jyh91\NewHomePage || exit /b 1

git checkout main || exit /b 1
git add .

git diff --cached --quiet || git commit -m "Update project"

git pull --rebase origin main || exit /b 1
git push origin main || exit /b 1

echo.
echo GitHub yangilandi.
pause
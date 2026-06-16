@echo off
echo ==============================================
echo Pushing latest HealthSync changes to GitHub...
echo ==============================================
git add .
git commit -m "Update Nearby Hospitals with full multilingual support"
git push origin main
echo ==============================================
echo Push complete! Vercel will now update your site.
echo ==============================================
pause

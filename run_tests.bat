@echo off
echo 🧪 Testing Complete Voice Agent System
echo ====================================

echo Installing required packages...
C:/Code/atuomate-web/backend/venv/Scripts/python.exe -m pip install requests --quiet

echo.
echo Running comprehensive test suite...
C:/Code/atuomate-web/backend/venv/Scripts/python.exe test_complete_system.py

echo.
echo Test complete! Check the output above for results.
pause

@echo off
echo 🚀 Starting StreamlineAI Backend Server
echo =====================================

cd backend
echo Starting FastAPI server on port 8005...
C:/Code/atuomate-web/backend/venv/Scripts/python.exe -m uvicorn main:app --reload --host localhost --port 8005

pause

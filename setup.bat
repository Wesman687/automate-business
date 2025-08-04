@echo off
echo Setting up Streamline Tech Solutions project...

echo.
echo Installing Node.js dependencies...
call npm install

echo.
echo Installing Python dependencies...
cd backend
pip install -r requirements.txt
cd ..

echo.
echo Setup complete!
echo.
echo To start the development servers:
echo   Frontend only: npm run dev
echo   Backend only:   npm run backend:dev  
echo   Both together:  npm run dev:full
echo.
echo Don't forget to:
echo 1. Add your OpenAI API key to backend/.env
echo 2. Replace OPENAI_API_KEY=your_openai_api_key_here with your actual key
echo.
pause

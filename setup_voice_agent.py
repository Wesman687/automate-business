# Voice Agent Integration - Quick Setup Script
# Run this script to test your voice agent API endpoints

import subprocess
import sys
import os

def install_requirements():
    """Install required packages for testing"""
    try:
        import requests
        print("✅ requests library already installed")
    except ImportError:
        print("📦 Installing requests library...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
        print("✅ requests library installed")

def check_backend_status():
    """Check if backend is running"""
    try:
        import requests
        response = requests.get("http://localhost:8005/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running and healthy!")
            return True
        else:
            print(f"⚠️  Backend responded with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend is not running")
        return False
    except Exception as e:
        print(f"❌ Error checking backend: {e}")
        return False

def run_voice_tests():
    """Run the voice agent test suite"""
    print("\n🎙️  Running Voice Agent Tests...")
    try:
        result = subprocess.run([sys.executable, "test_voice_agent.py"], 
                              capture_output=True, text=True)
        print(result.stdout)
        if result.stderr:
            print("Errors:", result.stderr)
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        return False

def main():
    print("🚀 Voice Agent Integration Setup")
    print("=" * 40)
    
    # Step 1: Install dependencies
    print("\n1. Installing Dependencies...")
    install_requirements()
    
    # Step 2: Check backend
    print("\n2. Checking Backend Status...")
    if not check_backend_status():
        print("\n❌ Backend is not running!")
        print("\nTo start the backend:")
        print("1. cd backend")
        print("2. uvicorn main:app --reload --host localhost --port 8005")
        print("\nOr use the VS Code task: 'Run Backend Server'")
        return
    
    # Step 3: Run tests
    print("\n3. Running Voice Agent Tests...")
    if run_voice_tests():
        print("\n🎉 All tests completed!")
    else:
        print("\n⚠️  Some tests may have failed - check output above")
    
    print("\n📋 Next Steps for Ultravox + Twilio:")
    print("1. Copy function definitions from VOICE_AGENT_INTEGRATION.md")
    print("2. Configure Ultravox with your backend URL (http://localhost:8005)")
    print("3. Set up Twilio webhook to point to Ultravox")
    print("4. Test with voice calls!")

if __name__ == "__main__":
    main()

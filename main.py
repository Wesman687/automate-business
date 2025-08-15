# main.py at project root
import os
import sys
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / "backend"
VENV = BACKEND / "venv"  # adjust if your venv is named differently

# Pick correct Python executable inside venv
if os.name == "nt":  # Windows
    python_executable = VENV / "Scripts" / "python.exe"
else:  # macOS/Linux
    python_executable = VENV / "bin" / "python"

# Build path to backend/main.py
backend_main = BACKEND / "main.py"

# Launch it using venv's Python
subprocess.run([str(python_executable), str(backend_main)], check=True)

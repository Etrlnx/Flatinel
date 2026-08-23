import os
import sys
import subprocess
import signal
import time

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(root_dir, "frontend")

    venv_python = os.path.join(root_dir, "venv", "Scripts", "python.exe")
    if not os.path.exists(venv_python):
        venv_python = sys.executable

    backend_cmd = [venv_python, "-m", "uvicorn", "backend.app.main:app", "--reload", "--port", "8000"]
    frontend_cmd = ["npm", "run", "dev"]

    print("🚀 Starting Flatinel Full-Stack Application...")
    print("🔹 Backend API:  http://127.0.0.1:8000  (Docs: http://127.0.0.1:8000/docs)")
    print("🔹 Frontend Web: http://localhost:5173")
    print("👉 Press Ctrl+C to stop both servers.\n")

    backend_proc = subprocess.Popen(backend_cmd, cwd=root_dir, shell=False)
    frontend_proc = subprocess.Popen(frontend_cmd, cwd=frontend_dir, shell=True)

    try:
        while True:
            time.sleep(0.5)
            if backend_proc.poll() is not None or frontend_proc.poll() is not None:
                break
    except KeyboardInterrupt:
        print("\n🛑 Shutting down servers...")
    finally:
        if backend_proc.poll() is None:
            backend_proc.terminate()
        if frontend_proc.poll() is None:
            if sys.platform == "win32":
                subprocess.call(["taskkill", "/F", "/T", "/PID", str(frontend_proc.pid)])
            else:
                frontend_proc.terminate()

if __name__ == "__main__":
    main()

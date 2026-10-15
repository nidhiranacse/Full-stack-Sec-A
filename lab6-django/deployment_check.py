import os
import sys
import django

print("=== Deployment Environment Check ===")

print("\nPython:")
print(sys.executable)
print(sys.version)

print("\nDjango:")
print(django.get_version())

print("\nProject Path:")
print(os.getcwd())

print("\nEnvironment Keys:")
print("DEBUG =", os.environ.get("DEBUG", "Not Set"))
print("SECRET_KEY =", "Set" if os.environ.get("SECRET_KEY") else "Not Set")
print("ALLOWED_HOSTS =", os.environ.get("ALLOWED_HOSTS", "Not Set"))

print("\nRequired Modules:")
try:
    import django

    print("Django: OK")
except ImportError:
    print("Django: Missing")

print("\nDeployment check completed.")

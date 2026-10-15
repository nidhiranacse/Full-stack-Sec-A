import os
import sys

print("----- DEPLOYMENT CHECK -----")

print("\nPython Version:")
print(sys.version)

print("\nPython Executable Path:")
print(sys.executable)

print("\nChecking Django Installation:")
try:
    import django

    print("Django Version:", django.get_version())
except ImportError:
    print("Django is NOT installed.")

print("\nChecking Environment Variable:")
secret_key = os.getenv("DJANGO_SECRET_KEY")

if secret_key:
    print("DJANGO_SECRET_KEY is set.")
else:
    print("DJANGO_SECRET_KEY is NOT set.")

print("\n----- CHECK COMPLETED -----")

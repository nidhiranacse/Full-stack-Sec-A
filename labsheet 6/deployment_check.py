import os
import sys
import importlib.util


def check_python():
    print("Python:", sys.version)
    print("Python Path:", sys.executable)


def check_django():
    if importlib.util.find_spec("django"):
        import django
        print("Django:", django.get_version())
    else:
        print("Django: NOT INSTALLED")


def check_environment():
    keys = ["DJANGO_SETTINGS_MODULE", "SECRET_KEY"]

    for key in keys:
        if os.environ.get(key):
            print(f"{key}: OK")
        else:
            print(f"{key}: MISSING")


print("=== Deployment Check ===")

check_python()
check_django()
check_environment()
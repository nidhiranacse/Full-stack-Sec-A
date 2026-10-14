import os
import sys
import importlib.util
import shutil


def print_status(check_name, status, message):
    """Display the result of each deployment check."""
    symbol = "[OK]" if status else "[FAIL]"
    print(f"{symbol} {check_name}: {message}")


def check_python():
    """Check the installed Python version."""
    version = sys.version_info

    is_valid = version.major == 3 and version.minor >= 10

    print_status(
        "Python Runtime",
        is_valid,
        f"Python {version.major}.{version.minor}.{version.micro}"
    )

    return is_valid


def check_virtual_environment():
    """Check whether the script is running inside a virtual environment."""
    virtual_env = os.environ.get("VIRTUAL_ENV")

    is_active = virtual_env is not None

    if is_active:
        message = virtual_env
    else:
        message = "Virtual environment is not active"

    print_status(
        "Virtual Environment",
        is_active,
        message
    )

    return is_active


def check_django():
    """Check whether Django is installed."""
    django_exists = importlib.util.find_spec("django") is not None

    if django_exists:
        import django

        print_status(
            "Django Framework",
            True,
            f"Django {django.get_version()}"
        )
    else:
        print_status(
            "Django Framework",
            False,
            "Django is not installed"
        )

    return django_exists


def check_required_packages():
    """Check required Python packages."""
    required_packages = [
        "django"
    ]

    all_installed = True

    for package in required_packages:
        installed = importlib.util.find_spec(package) is not None

        print_status(
            f"Dependency: {package}",
            installed,
            "Installed" if installed else "Missing"
        )

        if not installed:
            all_installed = False

    return all_installed


def check_python_path():
    """Check whether Python is available through the system PATH."""
    python_path = shutil.which("python")

    is_available = python_path is not None

    print_status(
        "Python PATH",
        is_available,
        python_path if is_available else "Python not found in PATH"
    )

    return is_available


def check_environment_keys():
    """Check important deployment environment variables."""
    environment_keys = [
        "PATH",
        "VIRTUAL_ENV"
    ]

    all_available = True

    for key in environment_keys:
        value = os.environ.get(key)

        exists = value is not None

        print_status(
            f"Environment Key: {key}",
            exists,
            "Available" if exists else "Not available"
        )

        if not exists:
            all_available = False

    return all_available


def main():
    """Run all deployment checks."""

    print("=" * 55)
    print("        DJANGO DEPLOYMENT ENVIRONMENT CHECK")
    print("=" * 55)

    results = []

    results.append(check_python())
    results.append(check_virtual_environment())
    results.append(check_django())
    results.append(check_required_packages())
    results.append(check_python_path())
    results.append(check_environment_keys())

    print()
    print("=" * 55)

    if all(results):
        print("[SUCCESS] All deployment checks passed.")
    else:
        print("[WARNING] Some deployment checks failed.")

    print("=" * 55)


if __name__ == "__main__":
    main()
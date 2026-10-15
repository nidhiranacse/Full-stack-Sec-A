"""
Automated Verification Suite for Lab Sheet 07
Student: Rahul Raj (cu24250116)
Course: Full Stack Web Development (Sec-A)
"""

import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lab7_project.settings')
django.setup()

from django.test import Client

def run_tests():
    print("=" * 65)
    print(" LAB SHEET 07: AUTOMATED VERIFICATION SUITE")
    print(" Candidate: Rahul Raj | cu24250116 | Full-stack Sec-A")
    print("=" * 65)

    client = Client()
    passed = 0
    total = 4

    # Test 1: Default Catalog Rendering
    print("\n[1/4] Testing Default Catalog Rendering & Matrix Collections...")
    response = client.get('/')
    if response.status_code == 200 and b"Alphonso Mango" in response.content and b"Rahul Raj" in response.content:
        print("  --> [PASS] Matrix and indices rendered successfully (200 OK)")
        passed += 1
    else:
        print(f"  --> [FAIL] Status: {response.status_code}")

    # Test 2: Task 7.1 Fallback Logic Filters
    print("[2/4] Testing Task 7.1 Fallback Logic Condition Filters...")
    response = client.get('/?empty_fruits=1')
    if b"Notice: No Fruit Records Found" in response.content:
        print("  --> [PASS] Fallback condition alert triggered correctly when array is empty")
        passed += 1
    else:
        print("  --> [FAIL] Fallback alert not observed")

    # Test 3: Task 7.2 Dynamic Table Sorting
    print("[3/4] Testing Task 7.2 Dynamic Table Sorting...")
    response = client.get('/?sort=name&order=asc')
    content = response.content.decode()
    tbody = content[content.find("<tbody>"):content.find("</tbody>")] if "<tbody>" in content else content
    idx_aarav = tbody.find("Aarav Sharma")
    idx_rahul = tbody.find("Rahul Raj")
    if idx_aarav != -1 and idx_rahul != -1 and idx_aarav < idx_rahul:
        print("  --> [PASS] Dynamic sorting applied: 'Aarav' precedes 'Rahul' ascending in table")
        passed += 1
    else:
        print("  --> [FAIL] Sorting order incorrect in table body")

    # Test 4: Task 7.3 User Search Input Filtering
    print("[4/4] Testing Task 7.3 Search Input Query Processing...")
    response = client.get('/?q=mango')
    content = response.content.decode()
    if "Alphonso Mango" in content and "Kashmiri Apple" not in content:
        print("  --> [PASS] Search filter successfully subsetted items to 'Alphonso Mango'")
        passed += 1
    else:
        print("  --> [FAIL] Search filter did not isolate query correctly")

    print("\n" + "-" * 65)
    print(f" Verification Result: {passed}/{total} tests passed.")
    if passed == total:
        print(" ALL LAB SHEET 07 TASKS VERIFIED SUCCESSFULLY!\n")
        return 0
    return 1

if __name__ == '__main__':
    sys.exit(run_tests())

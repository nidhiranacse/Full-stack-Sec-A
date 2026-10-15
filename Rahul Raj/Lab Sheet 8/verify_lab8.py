"""
Automated Verification Suite for Lab Sheet 08
Student: Rahul Raj (cu24250116)
Course: Full Stack Web Development (Sec-A)
"""

import os
import sys
from pathlib import Path
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lab8_project.settings')
django.setup()

from django.test import Client

def run_tests():
    print("=" * 68)
    print(" LAB SHEET 08: AUTOMATED VERIFICATION SUITE")
    print(" Candidate: Rahul Raj | cu24250116 | Full-stack Sec-A")
    print("=" * 68)

    client = Client()
    passed = 0
    total = 5

    # Test 1: Home View & Active Nav Marker
    print("\n[1/5] Testing Home View Template Inheritance & Active Nav Marker...")
    res = client.get('/')
    if res.status_code == 200 and 'Home\n            </a>' in res.content.decode() or 'active' in res.content.decode():
        content = res.content.decode()
        if 'class="nav-link active"' in content and "Home" in content:
            print("  --> [PASS] Home view rendered with 'active' class on Home navigation link")
            passed += 1
        else:
            print("  --> [FAIL] Active class not found on home link")
    else:
        print(f"  --> [FAIL] Status: {res.status_code}")

    # Test 2: About View Active Nav Marker
    print("[2/5] Testing About Us View & Dynamic Active Nav Marker...")
    res = client.get('/about/')
    content = res.content.decode()
    if res.status_code == 200 and 'About Us' in content and 'class="nav-link active"' in content:
        print("  --> [PASS] About Us view rendered with 'active' class on About navigation link")
        passed += 1
    else:
        print(f"  --> [FAIL] About Us active highlight check failed")

    # Test 3: Contact Us View & Active Nav Marker
    print("[3/5] Testing Contact Us View & Dynamic Active Nav Marker...")
    res = client.get('/contact/')
    content = res.content.decode()
    if res.status_code == 200 and 'Contact Us' in content and 'class="nav-link active"' in content:
        print("  --> [PASS] Contact Us view rendered with 'active' class on Contact navigation link")
        passed += 1
    else:
        print(f"  --> [FAIL] Contact Us active highlight check failed")

    # Test 4: Task 8.2 Feedback Message Box Hook
    print("[4/5] Testing Task 8.2 Inherited Feedback Notification Hook...")
    res = client.get('/?simulate_alert=info')
    content = res.content.decode()
    if "System Notification: Welcome to the modular Django UI blueprint." in content:
        print("  --> [PASS] Message box hook rendered persistent notification successfully")
        passed += 1
    else:
        print("  --> [FAIL] Simulated feedback message did not render")

    # Test 5: Task 8.3 Contact Form Submission & Server Logging
    print("[5/5] Testing Task 8.3 Contact Form Processing & Server Logging...")
    post_data = {
        'name': 'Rahul Raj',
        'email': 'cu24250116@cuchd.in',
        'subject': 'Syllabus Evaluation Verification',
        'message': 'Automated test feedback logged for system audit.',
    }
    res = client.post('/contact/', data=post_data, follow=True)
    content = res.content.decode()
    
    # Check for success message in redirected response
    msg_ok = "Verification Successful" in content and "securely logged to the server logs" in content
    
    # Check server.log existence and content
    log_file = Path(__file__).resolve().parent / 'server.log'
    log_ok = False
    if log_file.exists():
        with open(log_file, 'r', encoding='utf-8') as f:
            logs = f.read()
            if "[VERIFIED FEEDBACK LOGGED]" in logs and "Rahul Raj" in logs:
                log_ok = True

    if msg_ok and log_ok:
        print("  --> [PASS] Form validated, feedback notification dispatched, and parameters verified in server.log")
        passed += 1
    else:
        print(f"  --> [FAIL] Form submission check failed (Message OK: {msg_ok}, Log OK: {log_ok})")

    print("\n" + "-" * 68)
    print(f" Verification Result: {passed}/{total} tests passed.")
    if passed == total:
        print(" ALL LAB SHEET 08 TASKS VERIFIED SUCCESSFULLY!\n")
        return 0
    return 1

if __name__ == '__main__':
    sys.exit(run_tests())

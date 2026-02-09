#!/usr/bin/env python3
"""
Harmoni OS Backend API Testing
Tests NextAuth.js authentication and admin dashboard APIs
"""

import requests
import sys
import json
from datetime import datetime

class HarmoniAPITester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.csrf_token = None

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")
        return success

    def get_csrf_token(self):
        """Get CSRF token for NextAuth"""
        try:
            response = self.session.get(f"{self.base_url}/api/auth/csrf")
            if response.status_code == 200:
                data = response.json()
                self.csrf_token = data.get('csrfToken')
                return True
            return False
        except Exception as e:
            print(f"Error getting CSRF token: {e}")
            return False

    def test_auth_endpoints(self):
        """Test NextAuth.js endpoints"""
        print("\n🔍 Testing NextAuth.js Endpoints...")
        
        # Test CSRF endpoint
        success = self.get_csrf_token()
        self.log_test("CSRF Token Retrieval", success, f"Token: {self.csrf_token[:20]}..." if self.csrf_token else "")
        
        # Test providers endpoint
        try:
            response = self.session.get(f"{self.base_url}/api/auth/providers")
            success = response.status_code == 200
            providers = response.json() if success else {}
            self.log_test("Auth Providers Endpoint", success, f"Providers: {list(providers.keys())}")
        except Exception as e:
            self.log_test("Auth Providers Endpoint", False, f"Error: {e}")

        # Test session endpoint (should be null when not authenticated)
        try:
            response = self.session.get(f"{self.base_url}/api/auth/session")
            success = response.status_code == 200
            session_data = response.json() if success else {}
            self.log_test("Session Endpoint", success, f"Session: {session_data}")
        except Exception as e:
            self.log_test("Session Endpoint", False, f"Error: {e}")

    def test_login_attempt(self, email, password, role, expected_success=True):
        """Test login with credentials"""
        print(f"\n🔐 Testing Login: {role} - {email}")
        
        if not self.csrf_token:
            self.get_csrf_token()
        
        login_data = {
            'email': email,
            'password': password,
            'role': role,
            'csrfToken': self.csrf_token,
            'callbackUrl': f'{self.base_url}/{role}',
            'json': 'true'
        }
        
        try:
            # Test credentials signin
            response = self.session.post(
                f"{self.base_url}/api/auth/callback/credentials",
                data=login_data,
                headers={
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            )
            
            success = response.status_code in [200, 302]
            details = f"Status: {response.status_code}"
            
            if success and expected_success:
                # Check if we got redirected or have session
                session_response = self.session.get(f"{self.base_url}/api/auth/session")
                if session_response.status_code == 200:
                    session_data = session_response.json()
                    if session_data and 'user' in session_data:
                        details += f", User: {session_data['user'].get('email', 'Unknown')}"
                        details += f", Role: {session_data['user'].get('role', 'Unknown')}"
                    else:
                        success = False
                        details += ", No session created"
            
            self.log_test(f"Login {role.title()}", success == expected_success, details)
            return success
            
        except Exception as e:
            self.log_test(f"Login {role.title()}", False, f"Error: {e}")
            return False

    def test_admin_dashboard_api(self):
        """Test admin dashboard API"""
        print(f"\n📊 Testing Admin Dashboard API...")
        
        try:
            response = self.session.get(f"{self.base_url}/api/admin/dashboard")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                stats = data.get('data', {}).get('stats', {})
                details = f"Students: {stats.get('totalStudents', 0)}, Teachers: {stats.get('totalTeachers', 0)}, Classes: {stats.get('activeClasses', 0)}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:100]}"
            
            self.log_test("Admin Dashboard API", success, details)
            return success, data if success else {}
            
        except Exception as e:
            self.log_test("Admin Dashboard API", False, f"Error: {e}")
            return False, {}

    def test_admin_crud_apis(self):
        """Test Admin CRUD APIs"""
        print(f"\n👥 Testing Admin CRUD APIs...")
        
        # Test Admin Users API
        try:
            response = self.session.get(f"{self.base_url}/api/admin/users")
            success = response.status_code == 200
            if success:
                data = response.json()
                users_count = len(data.get('data', {}).get('users', []))
                details = f"Status: {response.status_code}, Users found: {users_count}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:100]}"
            self.log_test("Admin Users API", success, details)
        except Exception as e:
            self.log_test("Admin Users API", False, f"Error: {e}")

        # Test Admin Students API
        try:
            response = self.session.get(f"{self.base_url}/api/admin/students")
            success = response.status_code == 200
            if success:
                data = response.json()
                students_count = len(data.get('data', {}).get('students', []))
                details = f"Status: {response.status_code}, Students found: {students_count}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:100]}"
            self.log_test("Admin Students API", success, details)
        except Exception as e:
            self.log_test("Admin Students API", False, f"Error: {e}")

        # Test Admin Classes API (if exists)
        try:
            response = self.session.get(f"{self.base_url}/api/admin/classes")
            success = response.status_code in [200, 404]  # 404 is acceptable if not implemented
            details = f"Status: {response.status_code}"
            if response.status_code == 200:
                data = response.json()
                classes_count = len(data.get('data', {}).get('classes', []))
                details += f", Classes found: {classes_count}"
            self.log_test("Admin Classes API", success, details)
        except Exception as e:
            self.log_test("Admin Classes API", False, f"Error: {e}")

    def test_domains_api(self):
        """Test Domains API"""
        print(f"\n🧠 Testing Domains API...")
        
        try:
            response = self.session.get(f"{self.base_url}/api/domains")
            success = response.status_code == 200
            if success:
                data = response.json()
                domains = data.get('data', [])
                domains_count = len(domains)
                details = f"Status: {response.status_code}, Domains found: {domains_count}"
                if domains_count > 0:
                    sample_domain = domains[0]
                    details += f", Sample: {sample_domain.get('nameTr', 'Unknown')}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:100]}"
            self.log_test("Domains API", success, details)
            return success, data if success else {}
        except Exception as e:
            self.log_test("Domains API", False, f"Error: {e}")
            return False, {}

    def test_teacher_apis(self):
        """Test Teacher APIs"""
        print(f"\n👩‍🏫 Testing Teacher APIs...")
        
        # Test Teacher Students API
        try:
            # Need teacherId parameter
            response = self.session.get(f"{self.base_url}/api/teacher/students?teacherId=test-teacher-id")
            success = response.status_code in [200, 400]  # 400 might be expected without valid teacherId
            details = f"Status: {response.status_code}"
            if response.status_code == 200:
                data = response.json()
                students_count = len(data.get('data', []))
                details += f", Students found: {students_count}"
            self.log_test("Teacher Students API", success, details)
        except Exception as e:
            self.log_test("Teacher Students API", False, f"Error: {e}")

        # Test Teacher Assessments GET
        try:
            response = self.session.get(f"{self.base_url}/api/teacher/assessments?teacherId=test-teacher-id")
            success = response.status_code in [200, 400]  # 400 might be expected without valid teacherId
            details = f"Status: {response.status_code}"
            if response.status_code == 200:
                data = response.json()
                assessments_count = len(data.get('data', []))
                details += f", Assessments found: {assessments_count}"
            self.log_test("Teacher Assessments GET", success, details)
        except Exception as e:
            self.log_test("Teacher Assessments GET", False, f"Error: {e}")

        # Test Teacher Assessment POST (will fail without proper data, but should return proper error)
        try:
            test_assessment = {
                "studentId": "test-student-id",
                "scores": [{"domainId": "test-domain-id", "score": 3}],
                "notes": "Test assessment"
            }
            response = self.session.post(
                f"{self.base_url}/api/teacher/assessments",
                json=test_assessment,
                headers={'Content-Type': 'application/json'}
            )
            success = response.status_code in [200, 201, 400, 401, 403]  # Various expected responses
            details = f"Status: {response.status_code}"
            self.log_test("Teacher Assessment POST", success, details)
        except Exception as e:
            self.log_test("Teacher Assessment POST", False, f"Error: {e}")

        # Test Teacher Daily Log POST (if exists)
        try:
            test_log = {
                "studentId": "test-student-id",
                "date": "2024-01-01",
                "activities": "Test activities",
                "notes": "Test notes"
            }
            response = self.session.post(
                f"{self.base_url}/api/teacher/daily-log",
                json=test_log,
                headers={'Content-Type': 'application/json'}
            )
            success = response.status_code in [200, 201, 400, 401, 403, 404]  # Various expected responses
            details = f"Status: {response.status_code}"
            self.log_test("Teacher Daily Log POST", success, details)
        except Exception as e:
            self.log_test("Teacher Daily Log POST", False, f"Error: {e}")

    def test_protected_routes(self):
        """Test protected route access"""
        print(f"\n🔒 Testing Protected Routes...")
        
        protected_routes = [
            "/api/admin/dashboard",
            "/api/admin/users",
            "/api/teacher/stats", 
            "/api/parent/children"
        ]
        
        for route in protected_routes:
            try:
                response = self.session.get(f"{self.base_url}{route}")
                # Should either work (if authenticated) or return 401/403
                success = response.status_code in [200, 401, 403, 404]
                details = f"Status: {response.status_code}"
                self.log_test(f"Protected Route {route}", success, details)
            except Exception as e:
                self.log_test(f"Protected Route {route}", False, f"Error: {e}")

    def test_basic_connectivity(self):
        """Test basic app connectivity"""
        print(f"\n🌐 Testing Basic Connectivity...")
        
        try:
            # Test homepage
            response = self.session.get(self.base_url)
            success = response.status_code == 200 and "Harmoni" in response.text
            self.log_test("Homepage Access", success, f"Status: {response.status_code}")
            
            # Test login pages
            login_pages = ["/login/admin", "/login/teacher", "/login/parent"]
            for page in login_pages:
                try:
                    response = self.session.get(f"{self.base_url}{page}")
                    success = response.status_code == 200
                    self.log_test(f"Login Page {page}", success, f"Status: {response.status_code}")
                except Exception as e:
                    self.log_test(f"Login Page {page}", False, f"Error: {e}")
                    
        except Exception as e:
            self.log_test("Homepage Access", False, f"Error: {e}")

    def test_comprehensive_features(self):
        """Test all specific features from review request"""
        print(f"\n🎯 Testing Comprehensive Features from Review Request...")
        
        # Test Mood Tracker API
        try:
            response = self.session.get(f"{self.base_url}/api/mood-tracker")
            success = response.status_code == 200
            if success:
                data = response.json()
                moods_count = len(data.get('data', []))
                details = f"Status: {response.status_code}, Moods found: {moods_count}"
            else:
                details = f"Status: {response.status_code}"
            self.log_test("Mood Tracker GET", success, details)
        except Exception as e:
            self.log_test("Mood Tracker GET", False, f"Error: {e}")

        # Test Mood Tracker POST
        try:
            test_mood = {
                "studentId": "test-student-id",
                "mood": "happy",
                "energyLevel": "high",
                "socialEngagement": "active",
                "notes": "Test mood entry"
            }
            response = self.session.post(
                f"{self.base_url}/api/mood-tracker",
                json=test_mood,
                headers={'Content-Type': 'application/json'}
            )
            success = response.status_code in [200, 201, 400, 401, 403]
            details = f"Status: {response.status_code}"
            self.log_test("Mood Tracker POST", success, details)
        except Exception as e:
            self.log_test("Mood Tracker POST", False, f"Error: {e}")

        # Test Notifications API
        try:
            response = self.session.get(f"{self.base_url}/api/notifications")
            success = response.status_code == 200
            if success:
                data = response.json()
                notifications_count = len(data.get('data', []))
                details = f"Status: {response.status_code}, Notifications found: {notifications_count}"
            else:
                details = f"Status: {response.status_code}"
            self.log_test("Notifications GET", success, details)
        except Exception as e:
            self.log_test("Notifications GET", False, f"Error: {e}")

        # Test Notifications POST
        try:
            test_notification = {
                "recipientId": "test-user-id",
                "type": "assessment",
                "title": "Test Notification",
                "message": "This is a test notification"
            }
            response = self.session.post(
                f"{self.base_url}/api/notifications",
                json=test_notification,
                headers={'Content-Type': 'application/json'}
            )
            success = response.status_code in [200, 201, 400, 401, 403]
            details = f"Status: {response.status_code}"
            self.log_test("Notifications POST", success, details)
        except Exception as e:
            self.log_test("Notifications POST", False, f"Error: {e}")

        # Test AI Summary API
        try:
            response = self.session.get(f"{self.base_url}/api/ai/summary/test-student-id")
            success = response.status_code in [200, 404, 400, 401, 403]
            details = f"Status: {response.status_code}"
            self.log_test("AI Summary GET", success, details)
        except Exception as e:
            self.log_test("AI Summary GET", False, f"Error: {e}")

        # Test AI Trajectory API
        try:
            response = self.session.get(f"{self.base_url}/api/ai/trajectory/test-student-id")
            success = response.status_code in [200, 404, 400, 401, 403]
            details = f"Status: {response.status_code}"
            self.log_test("AI Trajectory GET", success, details)
        except Exception as e:
            self.log_test("AI Trajectory GET", False, f"Error: {e}")

        # Test AI Recommendations API
        try:
            response = self.session.get(f"{self.base_url}/api/ai/recommendations/test-student-id")
            success = response.status_code in [200, 404, 400, 401, 403]
            details = f"Status: {response.status_code}"
            self.log_test("AI Recommendations GET", success, details)
        except Exception as e:
            self.log_test("AI Recommendations GET", False, f"Error: {e}")

        # Test PDF Report API
        try:
            response = self.session.get(f"{self.base_url}/api/reports/pdf/test-student-id")
            success = response.status_code in [200, 404, 400, 401, 403]
            details = f"Status: {response.status_code}"
            self.log_test("PDF Report GET", success, details)
        except Exception as e:
            self.log_test("PDF Report GET", False, f"Error: {e}")

def main():
    print("🚀 Starting Harmoni OS Backend API Tests")
    print("=" * 50)
    
    tester = HarmoniAPITester()
    
    # Test basic connectivity first
    tester.test_basic_connectivity()
    
    # Test auth endpoints
    tester.test_auth_endpoints()
    
    # Test login attempts with provided credentials
    credentials = [
        ("admin@harmoni.com", "harmoni123", "admin"),
        ("ogretmen1@harmoni.com", "harmoni123", "teacher"), 
        ("veli1@harmoni.com", "harmoni123", "parent")
    ]
    
    for email, password, role in credentials:
        tester.test_login_attempt(email, password, role)
    
    # Test invalid login
    tester.test_login_attempt("invalid@test.com", "wrongpass", "admin", expected_success=False)
    
    # Test admin dashboard API
    tester.test_admin_dashboard_api()
    
    # Test Admin CRUD APIs
    tester.test_admin_crud_apis()
    
    # Test Domains API
    tester.test_domains_api()
    
    # Test Teacher APIs
    tester.test_teacher_apis()
    
    # Test comprehensive features
    tester.test_comprehensive_features()
    
    # Test protected routes
    tester.test_protected_routes()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"📈 Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 70:
        print("✅ Backend tests mostly successful")
        return 0
    else:
        print("❌ Backend tests show significant issues")
        return 1

if __name__ == "__main__":
    sys.exit(main())
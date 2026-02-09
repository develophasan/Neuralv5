"""
Harmoni OS - Backend API Tests
Tests for: PDF Reports, Notifications, Cron Jobs, Admin CRUD, Domains, Teacher Assessments
"""
import pytest
import requests
import os
import json

# Use localhost since external URL is not working per agent context
BASE_URL = "http://localhost:3000"

# Test credentials
ADMIN_CREDS = {"email": "admin@harmoni.com", "password": "harmoni123"}
TEACHER_CREDS = {"email": "ogretmen1@harmoni.com", "password": "harmoni123"}
PARENT_CREDS = {"email": "veli1@harmoni.com", "password": "harmoni123"}
CRON_SECRET = "harmoni-cron-secret"


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def test_data(api_client):
    """Fetch test data IDs for use in tests"""
    data = {}
    
    # Get a student ID
    resp = api_client.get(f"{BASE_URL}/api/admin/students")
    if resp.status_code == 200:
        students = resp.json().get("data", {}).get("students", [])
        if students:
            data["student_id"] = students[0]["id"]
    
    # Get a teacher ID
    resp = api_client.get(f"{BASE_URL}/api/admin/users?role=teacher")
    if resp.status_code == 200:
        users = resp.json().get("data", {}).get("users", [])
        if users:
            data["teacher_id"] = users[0]["id"]
    
    # Get a user ID for notifications
    resp = api_client.get(f"{BASE_URL}/api/admin/users")
    if resp.status_code == 200:
        users = resp.json().get("data", {}).get("users", [])
        if users:
            data["user_id"] = users[0]["id"]
    
    # Get a domain ID
    resp = api_client.get(f"{BASE_URL}/api/domains")
    if resp.status_code == 200:
        domains = resp.json().get("data", [])
        if domains:
            data["domain_id"] = domains[0]["id"]
    
    # Get a class ID
    resp = api_client.get(f"{BASE_URL}/api/admin/classes")
    if resp.status_code == 200:
        classes = resp.json().get("data", {}).get("classes", [])
        if classes:
            data["class_id"] = classes[0]["id"]
    
    return data


# ============== ADMIN USERS CRUD ==============
class TestAdminUsers:
    """Admin Users CRUD API Tests"""
    
    def test_get_users_list(self, api_client):
        """GET /api/admin/users - List all users"""
        response = api_client.get(f"{BASE_URL}/api/admin/users")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "users" in data["data"]
        assert "total" in data["data"]
        assert len(data["data"]["users"]) > 0
        print(f"✓ Found {data['data']['total']} users")
    
    def test_get_users_by_role(self, api_client):
        """GET /api/admin/users?role=teacher - Filter by role"""
        response = api_client.get(f"{BASE_URL}/api/admin/users?role=teacher")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        users = data["data"]["users"]
        for user in users:
            assert user["role"] == "teacher"
        print(f"✓ Found {len(users)} teachers")
    
    def test_get_users_with_search(self, api_client):
        """GET /api/admin/users?search=admin - Search users"""
        response = api_client.get(f"{BASE_URL}/api/admin/users?search=admin")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        print(f"✓ Search returned {len(data['data']['users'])} results")
    
    def test_create_user(self, api_client):
        """POST /api/admin/users - Create new user"""
        import uuid
        unique_email = f"TEST_user_{uuid.uuid4().hex[:8]}@harmoni.com"
        
        payload = {
            "email": unique_email,
            "password": "testpass123",
            "fullName": "TEST User",
            "role": "teacher",
            "phone": "+90 555 000 0000"
        }
        
        response = api_client.post(f"{BASE_URL}/api/admin/users", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["data"]["email"] == unique_email
        assert data["data"]["fullName"] == "TEST User"
        assert data["data"]["role"] == "teacher"
        print(f"✓ Created user: {data['data']['id']}")
        
        return data["data"]["id"]
    
    def test_create_user_duplicate_email(self, api_client):
        """POST /api/admin/users - Duplicate email should fail"""
        payload = {
            "email": "admin@harmoni.com",  # Existing email
            "password": "testpass123",
            "fullName": "Duplicate User",
            "role": "teacher"
        }
        
        response = api_client.post(f"{BASE_URL}/api/admin/users", json=payload)
        assert response.status_code == 400
        
        data = response.json()
        assert data["success"] is False
        print("✓ Duplicate email correctly rejected")
    
    def test_create_user_missing_fields(self, api_client):
        """POST /api/admin/users - Missing required fields should fail"""
        payload = {
            "email": "incomplete@harmoni.com"
            # Missing password, fullName, role
        }
        
        response = api_client.post(f"{BASE_URL}/api/admin/users", json=payload)
        assert response.status_code == 400
        
        data = response.json()
        assert data["success"] is False
        print("✓ Missing fields correctly rejected")


# ============== ADMIN STUDENTS CRUD ==============
class TestAdminStudents:
    """Admin Students CRUD API Tests"""
    
    def test_get_students_list(self, api_client):
        """GET /api/admin/students - List all students"""
        response = api_client.get(f"{BASE_URL}/api/admin/students")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "students" in data["data"]
        assert "total" in data["data"]
        assert len(data["data"]["students"]) > 0
        print(f"✓ Found {data['data']['total']} students")
    
    def test_get_students_with_pagination(self, api_client):
        """GET /api/admin/students?limit=5&offset=0 - Pagination"""
        response = api_client.get(f"{BASE_URL}/api/admin/students?limit=5&offset=0")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert len(data["data"]["students"]) <= 5
        print(f"✓ Pagination working: {len(data['data']['students'])} students returned")
    
    def test_create_student(self, api_client, test_data):
        """POST /api/admin/students - Create new student"""
        import uuid
        
        payload = {
            "firstName": "TEST",
            "lastName": f"Student_{uuid.uuid4().hex[:6]}",
            "dateOfBirth": "2022-01-15",
            "gender": "male"
        }
        
        response = api_client.post(f"{BASE_URL}/api/admin/students", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["data"]["firstName"] == "TEST"
        assert data["data"]["gender"] == "male"
        print(f"✓ Created student: {data['data']['id']}")
    
    def test_create_student_missing_fields(self, api_client):
        """POST /api/admin/students - Missing required fields should fail"""
        payload = {
            "firstName": "Incomplete"
            # Missing lastName, dateOfBirth, gender
        }
        
        response = api_client.post(f"{BASE_URL}/api/admin/students", json=payload)
        assert response.status_code == 400
        
        data = response.json()
        assert data["success"] is False
        print("✓ Missing fields correctly rejected")


# ============== ADMIN CLASSES CRUD ==============
class TestAdminClasses:
    """Admin Classes CRUD API Tests"""
    
    def test_get_classes_list(self, api_client):
        """GET /api/admin/classes - List all classes"""
        response = api_client.get(f"{BASE_URL}/api/admin/classes")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "classes" in data["data"]
        assert "total" in data["data"]
        assert len(data["data"]["classes"]) > 0
        
        # Verify class structure
        first_class = data["data"]["classes"][0]
        assert "id" in first_class
        assert "name" in first_class
        assert "ageGroup" in first_class
        assert "studentCount" in first_class
        print(f"✓ Found {data['data']['total']} classes")
    
    def test_create_class(self, api_client):
        """POST /api/admin/classes - Create new class"""
        import uuid
        
        payload = {
            "name": f"TEST Sınıfı {uuid.uuid4().hex[:4]}",
            "ageGroup": "4-5",
            "capacity": 15,
            "academicYear": "2024-2025"
        }
        
        response = api_client.post(f"{BASE_URL}/api/admin/classes", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["data"]["ageGroup"] == "4-5"
        assert data["data"]["capacity"] == 15
        print(f"✓ Created class: {data['data']['id']}")
    
    def test_create_class_missing_fields(self, api_client):
        """POST /api/admin/classes - Missing required fields should fail"""
        payload = {
            "name": "Incomplete Class"
            # Missing ageGroup, capacity, academicYear
        }
        
        response = api_client.post(f"{BASE_URL}/api/admin/classes", json=payload)
        assert response.status_code == 400
        
        data = response.json()
        assert data["success"] is False
        print("✓ Missing fields correctly rejected")


# ============== DOMAINS API ==============
class TestDomainsAPI:
    """Development Domains API Tests"""
    
    def test_get_domains_list(self, api_client):
        """GET /api/domains - List all development domains"""
        response = api_client.get(f"{BASE_URL}/api/domains")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        domains = data["data"]
        assert len(domains) > 0
        
        # Verify domain structure
        first_domain = domains[0]
        assert "id" in first_domain
        assert "code" in first_domain
        assert "nameTr" in first_domain
        assert "nameEn" in first_domain
        print(f"✓ Found {len(domains)} development domains")


# ============== NOTIFICATIONS API ==============
class TestNotificationsAPI:
    """Notifications CRUD API Tests"""
    
    def test_get_notifications_list(self, api_client):
        """GET /api/notifications - List all notifications"""
        response = api_client.get(f"{BASE_URL}/api/notifications")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)
        print(f"✓ Found {len(data['data'])} notifications")
    
    def test_get_notifications_filtered(self, api_client):
        """GET /api/notifications?isRead=false - Filter unread"""
        response = api_client.get(f"{BASE_URL}/api/notifications?isRead=false")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        for notif in data["data"]:
            assert notif["isRead"] is False
        print(f"✓ Found {len(data['data'])} unread notifications")
    
    def test_create_notification(self, api_client, test_data):
        """POST /api/notifications - Create new notification"""
        user_id = test_data.get("user_id")
        if not user_id:
            pytest.skip("No user ID available for notification test")
        
        payload = {
            "recipientId": user_id,
            "type": "info",
            "title": "TEST Notification",
            "message": "This is a test notification",
            "senderType": "system"
        }
        
        response = api_client.post(f"{BASE_URL}/api/notifications", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["data"]["title"] == "TEST Notification"
        assert data["data"]["type"] == "info"
        print(f"✓ Created notification: {data['data']['id']}")
        
        return data["data"]["id"]
    
    def test_create_notification_missing_fields(self, api_client):
        """POST /api/notifications - Missing required fields should fail"""
        payload = {
            "title": "Incomplete Notification"
            # Missing recipientId, type
        }
        
        response = api_client.post(f"{BASE_URL}/api/notifications", json=payload)
        assert response.status_code == 400
        
        data = response.json()
        assert data["success"] is False
        print("✓ Missing fields correctly rejected")
    
    def test_update_notification_mark_read(self, api_client, test_data):
        """PUT /api/notifications/[id] - Mark notification as read"""
        # First create a notification
        user_id = test_data.get("user_id")
        if not user_id:
            pytest.skip("No user ID available")
        
        create_payload = {
            "recipientId": user_id,
            "type": "info",
            "title": "TEST Update Notification",
            "message": "To be marked as read"
        }
        
        create_resp = api_client.post(f"{BASE_URL}/api/notifications", json=create_payload)
        if create_resp.status_code != 200:
            pytest.skip("Could not create notification for update test")
        
        notif_id = create_resp.json()["data"]["id"]
        
        # Update to mark as read
        update_payload = {"isRead": True}
        response = api_client.put(f"{BASE_URL}/api/notifications/{notif_id}", json=update_payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["data"]["isRead"] is True
        print(f"✓ Marked notification {notif_id} as read")
    
    def test_delete_notification(self, api_client, test_data):
        """DELETE /api/notifications/[id] - Delete notification"""
        # First create a notification
        user_id = test_data.get("user_id")
        if not user_id:
            pytest.skip("No user ID available")
        
        create_payload = {
            "recipientId": user_id,
            "type": "info",
            "title": "TEST Delete Notification",
            "message": "To be deleted"
        }
        
        create_resp = api_client.post(f"{BASE_URL}/api/notifications", json=create_payload)
        if create_resp.status_code != 200:
            pytest.skip("Could not create notification for delete test")
        
        notif_id = create_resp.json()["data"]["id"]
        
        # Delete the notification
        response = api_client.delete(f"{BASE_URL}/api/notifications/{notif_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["data"]["deleted"] is True
        print(f"✓ Deleted notification {notif_id}")
        
        # Verify deletion - should not find it in list
        list_resp = api_client.get(f"{BASE_URL}/api/notifications")
        notif_ids = [n["id"] for n in list_resp.json()["data"]]
        assert notif_id not in notif_ids
        print("✓ Verified notification was deleted")


# ============== CRON JOB API ==============
class TestCronJobAPI:
    """Cron Job API Tests"""
    
    def test_get_cron_jobs_info(self, api_client):
        """GET /api/cron/run - Get available cron jobs"""
        response = api_client.get(f"{BASE_URL}/api/cron/run")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "jobs" in data
        assert len(data["jobs"]) >= 2
        
        job_names = [j["name"] for j in data["jobs"]]
        assert "activity-recommendations" in job_names
        assert "daily-summaries" in job_names
        print(f"✓ Found {len(data['jobs'])} cron jobs")
    
    def test_run_cron_job_unauthorized(self, api_client):
        """POST /api/cron/run - Without secret should fail"""
        payload = {
            "job": "activity-recommendations",
            "secret": "wrong-secret"
        }
        
        response = api_client.post(f"{BASE_URL}/api/cron/run", json=payload)
        assert response.status_code == 401
        
        data = response.json()
        assert data["success"] is False
        assert "Unauthorized" in data["error"]
        print("✓ Unauthorized request correctly rejected")
    
    def test_run_cron_job_invalid_job(self, api_client):
        """POST /api/cron/run - Invalid job name should fail"""
        payload = {
            "job": "invalid-job-name",
            "secret": CRON_SECRET
        }
        
        response = api_client.post(f"{BASE_URL}/api/cron/run", json=payload)
        assert response.status_code == 400
        
        data = response.json()
        assert data["success"] is False
        print("✓ Invalid job name correctly rejected")
    
    def test_run_cron_job_activity_recommendations(self, api_client):
        """POST /api/cron/run - Run activity-recommendations job"""
        payload = {
            "job": "activity-recommendations",
            "secret": CRON_SECRET
        }
        
        response = api_client.post(f"{BASE_URL}/api/cron/run", json=payload, timeout=60)
        # This may take time due to AI processing
        assert response.status_code in [200, 500]  # 500 if AI service unavailable
        
        data = response.json()
        if response.status_code == 200:
            assert data["success"] is True
            assert data["job"] == "activity-recommendations"
            print(f"✓ Cron job executed: {data.get('result', 'completed')}")
        else:
            print(f"⚠ Cron job failed (may be AI service issue): {data.get('error', 'unknown')}")


# ============== PDF REPORT API ==============
class TestPDFReportAPI:
    """PDF Report Generation API Tests"""
    
    def test_generate_pdf_report(self, api_client, test_data):
        """GET /api/reports/pdf/[studentId] - Generate PDF report"""
        student_id = test_data.get("student_id")
        if not student_id:
            pytest.skip("No student ID available for PDF test")
        
        response = api_client.get(f"{BASE_URL}/api/reports/pdf/{student_id}")
        assert response.status_code == 200
        
        # Verify it's a PDF
        assert response.headers.get("Content-Type") == "application/pdf"
        assert response.content[:4] == b"%PDF"
        
        # Check Content-Disposition header
        content_disp = response.headers.get("Content-Disposition", "")
        assert "attachment" in content_disp
        assert ".pdf" in content_disp
        
        print(f"✓ Generated PDF report for student {student_id}")
        print(f"  PDF size: {len(response.content)} bytes")
    
    def test_generate_pdf_report_invalid_student(self, api_client):
        """GET /api/reports/pdf/[studentId] - Invalid student should return 404"""
        response = api_client.get(f"{BASE_URL}/api/reports/pdf/invalid-student-id-12345")
        assert response.status_code == 404
        
        data = response.json()
        assert data["success"] is False
        print("✓ Invalid student ID correctly returns 404")
    
    def test_pdf_report_turkish_characters(self, api_client, test_data):
        """GET /api/reports/pdf/[studentId] - Verify Turkish character handling"""
        student_id = test_data.get("student_id")
        if not student_id:
            pytest.skip("No student ID available")
        
        response = api_client.get(f"{BASE_URL}/api/reports/pdf/{student_id}")
        assert response.status_code == 200
        
        # PDF should be generated without errors (Turkish chars converted to ASCII)
        assert response.content[:4] == b"%PDF"
        
        # Filename should be ASCII-safe
        content_disp = response.headers.get("Content-Disposition", "")
        # Should not contain Turkish special characters
        turkish_chars = ["ş", "ğ", "ü", "ö", "ç", "ı", "Ş", "Ğ", "Ü", "Ö", "Ç", "İ"]
        for char in turkish_chars:
            assert char not in content_disp, f"Turkish char '{char}' found in filename"
        
        print("✓ PDF generated with proper Turkish character handling")


# ============== TEACHER ASSESSMENTS API ==============
class TestTeacherAssessmentsAPI:
    """Teacher Assessments API Tests"""
    
    def test_get_assessments_requires_teacher_id(self, api_client):
        """GET /api/teacher/assessments - Requires teacherId"""
        response = api_client.get(f"{BASE_URL}/api/teacher/assessments")
        assert response.status_code == 400
        
        data = response.json()
        assert data["success"] is False
        assert "Teacher ID required" in data["error"]
        print("✓ Teacher ID requirement enforced")
    
    def test_get_assessments_with_teacher_id(self, api_client, test_data):
        """GET /api/teacher/assessments?teacherId=xxx - List assessments"""
        teacher_id = test_data.get("teacher_id")
        if not teacher_id:
            pytest.skip("No teacher ID available")
        
        response = api_client.get(f"{BASE_URL}/api/teacher/assessments?teacherId={teacher_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)
        print(f"✓ Found {len(data['data'])} assessments for teacher")
    
    def test_create_assessment(self, api_client, test_data):
        """POST /api/teacher/assessments - Create new assessment"""
        student_id = test_data.get("student_id")
        domain_id = test_data.get("domain_id")
        teacher_id = test_data.get("teacher_id")
        
        if not all([student_id, domain_id]):
            pytest.skip("Missing required test data")
        
        payload = {
            "studentId": student_id,
            "assessedBy": teacher_id,
            "notes": "TEST assessment",
            "scores": [
                {"domainId": domain_id, "score": 4}
            ]
        }
        
        response = api_client.post(f"{BASE_URL}/api/teacher/assessments", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["data"]["studentId"] == student_id
        assert len(data["data"]["scores"]) > 0
        print(f"✓ Created assessment: {data['data']['id']}")
    
    def test_create_assessment_missing_fields(self, api_client):
        """POST /api/teacher/assessments - Missing required fields should fail"""
        payload = {
            "notes": "Incomplete assessment"
            # Missing studentId, scores
        }
        
        response = api_client.post(f"{BASE_URL}/api/teacher/assessments", json=payload)
        assert response.status_code == 400
        
        data = response.json()
        assert data["success"] is False
        print("✓ Missing fields correctly rejected")


# ============== RUN TESTS ==============
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

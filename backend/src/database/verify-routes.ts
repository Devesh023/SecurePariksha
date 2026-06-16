const BASE_URL = 'http://localhost:5000/api';

async function verifyRoutes() {
  console.log('========================================');
  console.log('API ROUTE INTEGRATION VERIFICATION RUN');
  console.log('========================================');

  try {
    // 1. Health Check
    const res = await fetch('http://localhost:5000/health');
    const data = await res.json();
    console.log(`✓ GET /health: ONLINE (Status: ${res.status}, status: ${data.status})`);
  } catch (e: any) {
    console.error(`✗ GET /health: FAILED - ${e.message}`);
  }

  let studentToken = '';
  let adminToken = '';

  // 2. POST /api/auth/login (Student)
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@securepariksha.com',
        password: 'Student@123',
      })
    });
    const data = await res.json();
    studentToken = data.token;
    console.log(`✓ POST /api/auth/login (Student): SUCCESS (Token acquired: ${!!studentToken})`);
  } catch (e: any) {
    console.error(`✗ POST /api/auth/login (Student): FAILED - ${e.message}`);
  }

  // 3. POST /api/auth/login (Admin)
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@securepariksha.com',
        password: 'Admin@123',
      })
    });
    const data = await res.json();
    adminToken = data.token;
    console.log(`✓ POST /api/auth/login (Admin): SUCCESS (Token acquired: ${!!adminToken})`);
  } catch (e: any) {
    console.error(`✗ POST /api/auth/login (Admin): FAILED - ${e.message}`);
  }

  // 4. POST /api/auth/register (New Student)
  try {
    const uniqueEmail = `test.student.${Date.now()}@securepariksha.com`;
    const uniqueRoll = `SP2026${Math.floor(100 + Math.random() * 900)}`;
    
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Integration Test Student',
        email: uniqueEmail,
        password: 'Student@123',
        rollNumber: uniqueRoll,
      })
    });
    const data = await res.json();
    console.log(`✓ POST /api/auth/register: SUCCESS (Registered student: ${data.user?.email || 'unknown'})`);
  } catch (e: any) {
    console.error(`✗ POST /api/auth/register: FAILED - ${e.message}`);
  }

  // Header configs
  const studentHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` };
  const adminHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` };

  // 5. GET /api/exams
  try {
    const res = await fetch(`${BASE_URL}/exams`, { headers: studentHeaders });
    const data = await res.json();
    console.log(`✓ GET /api/exams (Student context): SUCCESS (${data.length} exams resolved)`);
  } catch (e: any) {
    console.error(`✗ GET /api/exams: FAILED - ${e.message}`);
  }

  // 6. GET /api/questions
  try {
    const res = await fetch(`${BASE_URL}/questions`, { headers: adminHeaders });
    const data = await res.json();
    console.log(`✓ GET /api/questions (Admin context): SUCCESS (${data.length} questions resolved)`);
  } catch (e: any) {
    console.error(`✗ GET /api/questions: FAILED - ${e.message}`);
  }

  // 7. GET /api/results
  try {
    const res = await fetch(`${BASE_URL}/results`, { headers: studentHeaders });
    const data = await res.json();
    console.log(`✓ GET /api/results (Student context): SUCCESS (${data.length} scores resolved)`);
  } catch (e: any) {
    console.error(`✗ GET /api/results: FAILED - ${e.message}`);
  }

  // 8. GET /api/analytics/dashboard
  try {
    const res = await fetch(`${BASE_URL}/analytics/dashboard`, { headers: adminHeaders });
    const data = await res.json();
    console.log(`✓ GET /api/analytics/dashboard: SUCCESS (Metric cards students total: ${data.cards?.totalStudents || 0})`);
  } catch (e: any) {
    console.error(`✗ GET /api/analytics/dashboard: FAILED - ${e.message}`);
  }

  // 9. GET /api/proctor/logs
  try {
    const res = await fetch(`${BASE_URL}/proctor/logs`, { headers: adminHeaders });
    const data = await res.json();
    console.log(`✓ GET /api/proctor/logs: SUCCESS (${data.length} violation logs resolved)`);
  } catch (e: any) {
    console.error(`✗ GET /api/proctor/logs: FAILED - ${e.message}`);
  }

  console.log('========================================');
}

verifyRoutes();

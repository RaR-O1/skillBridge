import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { connectDB, disconnectDB } from '../config/database.js';
import { User } from '../modules/users/users.model.js';
import { generateDevToken } from '../config/firebase.js';

describe('SkillBridge Stage 1 API Suite', () => {
  let studentToken: string;
  let studentId: string;
  let businessToken: string;
  let businessId: string;
  let adminToken: string;
  let adminId: string;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('1. Health Check', () => {
    it('GET /health returns 200 and feature flags', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.featureFlags).toBeDefined();
    });
  });

  describe('2. Auth & Onboarding & College Verification', () => {
    it('POST /api/auth/login creates/logs in student and returns JWT', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test.student@stanford.edu',
          name: 'Stanford Student',
          role: 'student',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      studentToken = res.body.data.token;
      studentId = res.body.data.user._id;
    });

    it('POST /api/auth/login logs in local business', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'localbiz@citycafe.com',
          name: 'City Cafe Owner',
          role: 'local_business',
        });

      expect(res.status).toBe(200);
      businessToken = res.body.data.token;
      businessId = res.body.data.user._id;
    });

    it('POST /api/auth/login logs in admin', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@skillbridge.edu',
          name: 'Super Admin',
          role: 'admin',
        });

      expect(res.status).toBe(200);
      adminToken = res.body.data.token;
      adminId = res.body.data.user._id;
    });

    it('POST /api/auth/verify-college/send dispatches 6-digit verification code', async () => {
      const res = await request(app)
        .post('/api/auth/verify-college/send')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          collegeEmail: 'student@mit.edu',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBeDefined();

      const verificationCode = res.body.data.code;

      // Confirm verification
      const confirmRes = await request(app)
        .post('/api/auth/verify-college/confirm')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          collegeEmail: 'student@mit.edu',
          code: verificationCode,
        });

      expect(confirmRes.status).toBe(200);
      expect(confirmRes.body.data.user.collegeVerified).toBe(true);
    });

    it('GET /api/users/profile/:id returns public profile without private email', async () => {
      const res = await request(app).get(`/api/users/profile/${studentId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.profile.collegeVerified).toBe(true);
      expect(res.body.data.profile.collegeEmail).toBeUndefined(); // Confidentiality check
    });
  });

  describe('3. Hackathon Teams', () => {
    let teamId: string;
    let applicantToken: string;
    let applicantId: string;

    it('POST /api/teams creates a team request with auto-generated chat room', async () => {
      const futureDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const res = await request(app)
        .post('/api/teams')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'ETHGlobal Hackathon Squad',
          description: 'Looking for a smart contract and frontend developer',
          hackathonName: 'ETHGlobal Bangkok',
          skillsNeeded: ['Solidity', 'React'],
          teamSize: 2,
          deadline: futureDeadline,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.team.status).toBe('open');
      expect(res.body.data.team.chatRoomId).toBeDefined();
      teamId = res.body.data.team._id;
    });

    it('POST /api/teams/:id/apply applies to join team', async () => {
      // Create a second student
      const userRes = await request(app).post('/api/auth/login').send({
        email: 'applicant.dev@iit.ac.in',
        name: 'Applicant Student',
        role: 'student',
      });
      applicantToken = userRes.body.data.token;
      applicantId = userRes.body.data.user._id;

      const res = await request(app)
        .post(`/api/teams/${teamId}/apply`)
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          note: 'I have won 2 Web3 hackathons and know Solidity well.',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.application.status).toBe('pending');
    });

    it('PATCH /api/teams/:id/applications/:appId accepts applicant and auto-closes team when full', async () => {
      // Get applications
      const appsRes = await request(app)
        .get(`/api/teams/${teamId}/applications`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(appsRes.status).toBe(200);
      const appId = appsRes.body.data.applications[0]._id;

      // Accept applicant
      const acceptRes = await request(app)
        .patch(`/api/teams/${teamId}/applications/${appId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ status: 'accepted' });

      expect(acceptRes.status).toBe(200);
      expect(acceptRes.body.data.application.status).toBe('accepted');

      // Verify team is now auto-closed because teamSize = 2 is filled (owner + 1 accepted member)
      const teamRes = await request(app).get(`/api/teams/${teamId}`);
      expect(teamRes.body.data.team.status).toBe('closed');
      expect(teamRes.body.data.team.members.length).toBe(2);
    });
  });

  describe('4. Freelance Projects & Mutual Price Agreement Flow', () => {
    let projectId: string;
    let agreementId: string;

    it('POST /api/projects creates freelance project with agreed budget in INR', async () => {
      const deadline = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${businessToken}`)
        .send({
          title: 'Cafe Landing Page & QR Menu',
          description: 'Need a fast modern landing page with mobile menu for our bistro',
          category: 'Web Development',
          requiredSkills: ['React', 'Tailwind CSS'],
          budgetINR: 15000,
          deadline,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.project.status).toBe('open');
      expect(res.body.data.project.budgetINR).toBe(15000);
      projectId = res.body.data.project._id;
    });

    it('POST /api/projects/:id/apply student applies to project', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/apply`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          proposedBudgetINR: 15000,
          coverNote: 'I have built multiple restaurant sites. Can deliver in 5 days.',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.application.status).toBe('pending');
    });

    it('POST /api/agreements/select/:projectId owner selects student and creates price agreement card', async () => {
      const res = await request(app)
        .post(`/api/agreements/select/${projectId}`)
        .set('Authorization', `Bearer ${businessToken}`)
        .send({
          studentId,
          agreedAmountINR: 15000,
          paymentMethodNote: 'Direct UPI upon completion',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.agreement.businessConfirmed).toBe(true);
      expect(res.body.data.agreement.studentConfirmed).toBe(false);
      agreementId = res.body.data.agreement._id;

      // Project status should now be agreement_pending
      const projRes = await request(app).get(`/api/projects/${projectId}`);
      expect(projRes.body.data.project.status).toBe('agreement_pending');
    });

    it('POST /api/agreements/:id/confirm student confirms agreement, transitioning project to assigned', async () => {
      const res = await request(app)
        .post(`/api/agreements/${agreementId}/confirm`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ confirmed: true });

      expect(res.status).toBe(200);
      expect(res.body.data.agreement.studentConfirmed).toBe(true);
      expect(res.body.data.projectStatus).toBe('assigned');
    });

    it('POST /api/projects/:id/submit student submits deliverable (assigned -> in_review)', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          workUrl: 'https://cafe-menu-demo.vercel.app',
          notes: 'Completed all responsive layouts and QR scanning.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.project.status).toBe('in_review');
      expect(res.body.data.project.submission.workUrl).toBe('https://cafe-menu-demo.vercel.app');
    });

    it('POST /api/projects/:id/approve business approves deliverable (in_review -> completed)', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/approve`)
        .set('Authorization', `Bearer ${businessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.project.status).toBe('completed');
    });

    it('Reviews remain locked until student taps Payment Received', async () => {
      const reviewRes = await request(app)
        .post('/api/portfolio/reviews')
        .set('Authorization', `Bearer ${businessToken}`)
        .send({
          targetUserId: studentId,
          projectId,
          rating: 5,
          comment: 'Great work before payment!',
        });

      expect(reviewRes.status).toBe(400);
      expect(reviewRes.body.error.code).toBe('REVIEWS_LOCKED');
    });

    it('POST /api/agreements/confirm-payment/:projectId student confirms Payment Received, unlocking reviews', async () => {
      const res = await request(app)
        .post(`/api/agreements/confirm-payment/${projectId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.agreement.paymentReceived).toBe(true);

      // Now review unlocks!
      const unlockedReviewRes = await request(app)
        .post('/api/portfolio/reviews')
        .set('Authorization', `Bearer ${businessToken}`)
        .send({
          targetUserId: studentId,
          projectId,
          rating: 5,
          comment: 'Fantastic execution and timely delivery. 5/5 stars!',
        });

      expect(unlockedReviewRes.status).toBe(201);
      expect(unlockedReviewRes.body.data.review.rating).toBe(5);
    });
  });

  describe('5. Real-time Chat & Notifications', () => {
    it('POST /api/chat/rooms/:roomId/messages posts and retrieves chat history', async () => {
      const roomId = `dm_${studentId}_${businessId}`;
      const msgRes = await request(app)
        .post(`/api/chat/rooms/${roomId}/messages`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          content: 'Hello, checking in on the project scope!',
          fileUrl: 'https://example.com/mock-specs.pdf',
        });

      expect(msgRes.status).toBe(201);

      const historyRes = await request(app)
        .get(`/api/chat/rooms/${roomId}/messages`)
        .set('Authorization', `Bearer ${businessToken}`);

      expect(historyRes.status).toBe(200);
      expect(historyRes.body.data.messages.length).toBeGreaterThan(0);
    });

    it('GET /api/notifications retrieves student notifications', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.notifications)).toBe(true);
    });
  });

  describe('6. Reports & Admin Console with Audit Log', () => {
    let reportId: string;

    it('POST /api/reports submits report ("Payment not received", spam, etc.)', async () => {
      const res = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          category: 'payment_not_received',
          description: 'Client delay past agreed timeline for invoice',
        });

      expect(res.status).toBe(201);
      reportId = res.body.data.report._id;
    });

    it('Admin can view verification queue and metrics', async () => {
      const metricsRes = await request(app)
        .get('/api/admin/metrics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(metricsRes.status).toBe(200);
      expect(metricsRes.body.data.metrics.users).toBeDefined();

      const queueRes = await request(app)
        .get('/api/admin/queue')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(queueRes.status).toBe(200);
    });

    it('PATCH /api/reports/:id/status resolves report and creates audit log', async () => {
      const res = await request(app)
        .patch(`/api/reports/${reportId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'resolved',
          resolutionNotes: 'Parties reached mutual settlement via direct bank transfer.',
          actionToTake: 'none',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.report.status).toBe('resolved');

      // Verify audit log has recorded the action
      const auditRes = await request(app)
        .get('/api/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(auditRes.status).toBe(200);
      const hasResolveLog = auditRes.body.data.logs.some((l: any) => l.action === 'RESOLVE_REPORT');
      expect(hasResolveLog).toBe(true);
    });
  });
});

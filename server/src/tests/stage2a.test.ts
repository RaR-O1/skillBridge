import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { connectDB, disconnectDB } from '../config/database.js';
import { User } from '../modules/users/users.model.js';
import { Company, Job, JobApplication } from '../modules/jobs/jobs.model.js';

describe('SkillBridge Stage 2A API Suite: Companies, Jobs, Recruiter Pipeline & Talent Search', () => {
  let student1Token: string;
  let student1Id: string;
  let student2Token: string;
  let student2Id: string;
  let recruiterToken: string;
  let recruiterId: string;
  let adminToken: string;
  let adminId: string;
  let companyId: string;
  let jobId: string;
  let applicationId: string;

  beforeAll(async () => {
    await connectDB();

    // Clean up
    await Company.deleteMany({});
    await Job.deleteMany({});
    await JobApplication.deleteMany({});

    // 1. Create Student 1 (opted-in to recruiter search)
    const s1Res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'dev.student@mit.edu',
        name: 'Dev Student',
        role: 'student',
      });
    student1Token = s1Res.body.data.token;
    student1Id = s1Res.body.data.user._id;

    // Update student 1 profile with skills and visibility = true
    await request(app)
      .patch('/api/users/profile')
      .set('Authorization', `Bearer ${student1Token}`)
      .send({
        college: 'MIT',
        visibility: true,
        skills: [{ name: 'React', level: 5 }, { name: 'Node.js', level: 4 }],
      });

    // 2. Create Student 2 (opted-out from recruiter search)
    const s2Res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'private.student@harvard.edu',
        name: 'Private Student',
        role: 'student',
      });
    student2Token = s2Res.body.data.token;
    student2Id = s2Res.body.data.user._id;

    await request(app)
      .patch('/api/users/profile')
      .set('Authorization', `Bearer ${student2Token}`)
      .send({
        college: 'Harvard',
        visibility: false,
        skills: [{ name: 'React', level: 4 }],
      });

    // 3. Create Recruiter
    const rRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'recruiter@techventures.io',
        name: 'Alex Recruiter',
        role: 'company',
      });
    recruiterToken = rRes.body.data.token;
    recruiterId = rRes.body.data.user._id;

    // 4. Create Admin
    const aRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@skillbridge.edu',
        name: 'System Admin',
        role: 'admin',
      });
    adminToken = aRes.body.data.token;
    adminId = aRes.body.data.user._id;
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('1. Company Registration & Admin Verification', () => {
    it('POST /api/jobs/companies creates a company profile', async () => {
      const res = await request(app)
        .post('/api/jobs/companies')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          name: 'TechVentures Global',
          domain: 'techventures.io',
          description: 'High-growth cloud software company hiring university developers.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.company.name).toBe('TechVentures Global');
      expect(res.body.data.company.verified).toBe(false);
      companyId = res.body.data.company._id;
    });

    it('GET /api/admin/queue includes pending company in queue', async () => {
      const res = await request(app)
        .get('/api/admin/queue')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.companies).toBeDefined();
      const found = res.body.data.companies.find((c: any) => c._id === companyId);
      expect(found).toBeDefined();
    });

    it('POST /api/admin/verify-company/:id verifies company', async () => {
      const res = await request(app)
        .post(`/api/admin/verify-company/${companyId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ approved: true });

      expect(res.status).toBe(200);
      expect(res.body.data.company.verified).toBe(true);
    });
  });

  describe('2. Job Postings & Authorization', () => {
    it('POST /api/jobs succeeds when recruiter is a member of the company', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          companyId,
          title: 'Full Stack Engineering Intern',
          type: 'internship',
          location: 'San Francisco, CA or Remote',
          isRemote: true,
          stipendINR: 45000,
          requiredSkills: ['React', 'Node.js', 'MongoDB'],
          description: 'Help build scalable student platform features.',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.job.title).toBe('Full Stack Engineering Intern');
      jobId = res.body.data.job._id;
    });

    it('POST /api/jobs fails if unauthorized user attempts to post for that company', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          companyId,
          title: 'Unauthorized Posting',
          type: 'internship',
          location: 'Remote',
          stipendINR: 20000,
          requiredSkills: ['React'],
          description: 'Help build scalable student platform features with React and Node.',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });

      expect(res.status).toBe(403);
    });

    it('GET /api/jobs lists open jobs with filtering', async () => {
      const res = await request(app)
        .get('/api/jobs')
        .query({ skill: 'React', isRemote: 'true' });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.jobs)).toBe(true);
      expect(res.body.data.jobs.length).toBeGreaterThan(0);
      expect(res.body.data.jobs[0].title).toBe('Full Stack Engineering Intern');
    });
  });

  describe('3. Student Application & Recruiter Pipeline Flow', () => {
    it('POST /api/jobs/:id/apply submits student application', async () => {
      const res = await request(app)
        .post(`/api/jobs/${jobId}/apply`)
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          note: 'Excited about building high-traffic web applications with React & Node.js!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.application.stage).toBe('new');
      applicationId = res.body.data.application._id;
    });

    it('POST /api/jobs/:id/apply rejects duplicate application from same student', async () => {
      const res = await request(app)
        .post(`/api/jobs/${jobId}/apply`)
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          note: 'Trying to apply twice',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('already submitted');
    });

    it('GET /api/jobs/applications/my allows student to track their applications', async () => {
      const res = await request(app)
        .get('/api/jobs/applications/my')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.applications.length).toBe(1);
      expect(res.body.data.applications[0].stage).toBe('new');
    });

    it('GET /api/jobs/:id/applications allows recruiter to view applicants', async () => {
      const res = await request(app)
        .get(`/api/jobs/${jobId}/applications`)
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.applications.length).toBe(1);
      expect(res.body.data.applications[0].studentId.name).toBe('Dev Student');
    });

    it('PATCH /api/jobs/applications/:appId/stage moves applicant to shortlisted and then interview', async () => {
      const shortlistRes = await request(app)
        .patch(`/api/jobs/applications/${applicationId}/stage`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({ stage: 'shortlisted' });

      expect(shortlistRes.status).toBe(200);
      expect(shortlistRes.body.data.application.stage).toBe('shortlisted');

      const interviewRes = await request(app)
        .patch(`/api/jobs/applications/${applicationId}/stage`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({ stage: 'interview' });

      expect(interviewRes.status).toBe(200);
      expect(interviewRes.body.data.application.stage).toBe('interview');
    });

    it('POST /api/jobs/applications/:appId/notes records internal recruiter notes', async () => {
      const res = await request(app)
        .post(`/api/jobs/applications/${applicationId}/notes`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({ text: 'Strong in React component design. Proceeding to coding round.' });

      expect(res.status).toBe(200);
      expect(res.body.data.application.notes.length).toBe(1);
      expect(res.body.data.application.notes[0].text).toContain('Strong in React');
    });
  });

  describe('4. Student Talent Search & Privacy Visibility Rules', () => {
    it('GET /api/users/talent returns ONLY students who opted into recruiter search', async () => {
      const res = await request(app)
        .get('/api/users/talent')
        .query({ skill: 'React' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const studentNames = res.body.data.talent.map((s: any) => s.name);

      // Dev Student opted in (visibility: true)
      expect(studentNames).toContain('Dev Student');
      // Private Student opted out (visibility: false)
      expect(studentNames).not.toContain('Private Student');
    });
  });
});

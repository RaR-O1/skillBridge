import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { connectDB, disconnectDB } from '../config/database.js';
import { Startup, StartupApplication, CoFounderProfile } from '../modules/startups/startups.model.js';
import { MentorProfile, MentorshipSession, LearningResource, AlumniReferral } from '../modules/mentorship/mentorship.model.js';

describe('SkillBridge Stage 2B API Suite: Startups, Co-Founders, Mentorship & Referrals', () => {
  let studentToken: string;
  let studentId: string;
  let founderToken: string;
  let founderId: string;
  let mentorToken: string;
  let mentorId: string;

  let startupId: string;
  let roleId: string;
  let sessionId: string;
  let referralId: string;

  beforeAll(async () => {
    await connectDB();

    // Clean up
    await Startup.deleteMany({});
    await StartupApplication.deleteMany({});
    await CoFounderProfile.deleteMany({});
    await MentorProfile.deleteMany({});
    await MentorshipSession.deleteMany({});
    await LearningResource.deleteMany({});
    await AlumniReferral.deleteMany({});

    // 1. Create Student
    const sRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student.builder@iitd.ac.in',
        name: 'Aarav Sharma',
        role: 'student',
      });
    studentToken = sRes.body.data.token;
    studentId = sRes.body.data.user._id;

    // 2. Create Startup Founder
    const fRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'ananya@nexusai.dev',
        name: 'Ananya Sen',
        role: 'startup',
      });
    founderToken = fRes.body.data.token;
    founderId = fRes.body.data.user._id;

    // 3. Create Mentor / Alumni
    const mRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'vikram.nair@alumni.iitd.ac.in',
        name: 'Vikram Nair',
        role: 'mentor',
      });
    mentorToken = mRes.body.data.token;
    mentorId = mRes.body.data.user._id;
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('1. Startups & Open Roles & Applications', () => {
    it('POST /api/startups creates a new startup profile', async () => {
      const res = await request(app)
        .post('/api/startups')
        .set('Authorization', `Bearer ${founderToken}`)
        .send({
          name: 'NexusAI Diagnostics',
          pitch: 'Real-time AI copilot assisting radiologists in triage clinics.',
          description: 'Building multimodal transformer models for clinical diagnostic workflows with sub-second inference.',
          stage: 'mvp',
          website: 'https://nexusai.dev',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.startup.name).toBe('NexusAI Diagnostics');
      startupId = res.body.data.startup._id;
    });

    it('POST /api/startups/:id/roles allows founder to add an open role', async () => {
      const res = await request(app)
        .post(`/api/startups/${startupId}/roles`)
        .set('Authorization', `Bearer ${founderToken}`)
        .send({
          roleTitle: 'Technical Co-Founder (AI & Cloud)',
          roleType: 'co_founder',
          requiredSkills: ['Python', 'PyTorch', 'FastAPI'],
          equityOrStipend: '15% Equity Pool',
          description: 'Lead model training, microservice scaling, and clinical HIPAA compliance.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.startup.openRoles.length).toBe(1);
      roleId = res.body.data.startup.openRoles[0]._id;
    });

    it('POST /api/startups/:id/roles rejects non-founders', async () => {
      const res = await request(app)
        .post(`/api/startups/${startupId}/roles`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          roleTitle: 'Unauthorized Role Addition',
          roleType: 'intern',
          requiredSkills: ['React'],
          equityOrStipend: '₹10,000',
          description: 'Should be rejected because user is not a founder.',
        });

      expect(res.status).toBe(403);
    });

    it('POST /api/startups/:id/roles/:roleId/apply submits role application', async () => {
      const res = await request(app)
        .post(`/api/startups/${startupId}/roles/${roleId}/apply`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          coverLetter: 'Passionate about healthcare AI. Have built image segmentation pipelines in PyTorch.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.application.status).toBe('pending');
    });

    it('POST /api/startups/:id/roles/:roleId/apply rejects duplicate application', async () => {
      const res = await request(app)
        .post(`/api/startups/${startupId}/roles/${roleId}/apply`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          coverLetter: 'Applying twice should fail',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('already applied');
    });

    it('GET /api/startups/:id/applications allows founder to review applications', async () => {
      const res = await request(app)
        .get(`/api/startups/${startupId}/applications`)
        .set('Authorization', `Bearer ${founderToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.applications.length).toBe(1);
      expect(res.body.data.applications[0].applicantId.name).toBe('Aarav Sharma');
    });
  });

  describe('2. Co-Founder Matching Pool', () => {
    it('POST /api/startups/cofounders/profile upserts cofounder preferences', async () => {
      const res = await request(app)
        .post('/api/startups/cofounders/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          bio: 'Full-stack builder and hackathon winner looking for a commercial or AI co-founder.',
          skills: ['React', 'Node.js', 'System Design'],
          idealCoFounderRole: 'Product & Business Co-Founder',
          targetIndustry: 'HealthTech & Developer Tools',
          hoursPerWeek: 25,
          lookingFor: 'Looking for a domain expert to co-found a clinical diagnostic platform.',
          active: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profile.hoursPerWeek).toBe(25);
    });

    it('GET /api/startups/cofounders lists active co-founder profiles', async () => {
      const res = await request(app)
        .get('/api/startups/cofounders')
        .query({ skill: 'React' });

      expect(res.status).toBe(200);
      expect(res.body.data.coFounders.length).toBeGreaterThan(0);
      expect(res.body.data.coFounders[0].userId.name).toBe('Aarav Sharma');
    });
  });

  describe('3. Mentor Profiles & Sessions Lifecycle', () => {
    it('POST /api/mentorship/mentors/profile registers mentor profile', async () => {
      const res = await request(app)
        .post('/api/mentorship/mentors/profile')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({
          currentCompany: 'Stripe',
          jobTitle: 'Staff Engineer',
          yearsExperience: 6,
          bio: 'Staff Engineer at Stripe. Former campus builder, mentoring students on distributed architecture.',
          areasOfExpertise: ['System Design', 'Microservices', 'Distributed Systems'],
          hourlyAvailability: ['Saturday 10-12 AM IST', 'Sunday 4-6 PM IST'],
          maxMentees: 8,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profile.currentCompany).toBe('Stripe');
    });

    it('POST /api/mentorship/sessions/request/:mentorId student requests a session', async () => {
      const slot1 = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      const res = await request(app)
        .post(`/api/mentorship/sessions/request/${mentorId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          topic: 'High Scale Microservices Architecture Review',
          notes: 'Preparing for national hackathon finals with distributed queue system.',
          proposedTimes: [slot1],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.session.status).toBe('requested');
      expect(res.body.data.session.chatRoomId).toBeDefined();
      sessionId = res.body.data.session._id;
    });

    it('PATCH /api/mentorship/sessions/:id/propose-times mentor proposes updated slot', async () => {
      const newSlot = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
      const res = await request(app)
        .patch(`/api/mentorship/sessions/${sessionId}/propose-times`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({
          proposedTimes: [newSlot],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.session.status).toBe('proposed');
    });

    it('PATCH /api/mentorship/sessions/:id/confirm confirms session with meeting link', async () => {
      const confirmedTime = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
      const res = await request(app)
        .patch(`/api/mentorship/sessions/${sessionId}/confirm`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          confirmedTime,
          meetingLink: 'https://meet.google.com/xyz-abc-def',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.session.status).toBe('confirmed');
      expect(res.body.data.session.meetingLink).toContain('meet.google.com');
    });

    it('POST /api/mentorship/sessions/:id/feedback student leaves rating and review', async () => {
      const res = await request(app)
        .post(`/api/mentorship/sessions/${sessionId}/feedback`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          rating: 5,
          review: 'Vikram provided exceptional insights into distributed caching and event-driven architectures!',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.session.status).toBe('completed');
      expect(res.body.data.session.studentFeedback.rating).toBe(5);
    });

    it('GET /api/mentorship/sessions lists user mentorship sessions', async () => {
      const res = await request(app)
        .get('/api/mentorship/sessions')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.sessions.length).toBe(1);
    });
  });

  describe('4. Curated Learning Resources', () => {
    it('POST /api/mentorship/resources adds a community resource', async () => {
      const res = await request(app)
        .post('/api/mentorship/resources')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({
          title: 'Designing Data-Intensive Applications Cheat Sheet',
          category: 'system_design',
          url: 'https://github.com/ept/ddia-references',
          description: 'Essential summaries on storage engines, replication, and distributed consensus.',
          tags: ['System Design', 'Databases', 'Consensus'],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.resource.title).toContain('Designing Data-Intensive');
    });

    it('GET /api/mentorship/resources lists resources by category', async () => {
      const res = await request(app)
        .get('/api/mentorship/resources')
        .query({ category: 'system_design' });

      expect(res.status).toBe(200);
      expect(res.body.data.resources.length).toBeGreaterThan(0);
    });
  });

  describe('5. Alumni Referrals Flow', () => {
    it('POST /api/mentorship/referrals requests an internal referral from alumni', async () => {
      const res = await request(app)
        .post('/api/mentorship/referrals')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          mentorId,
          companyName: 'Stripe',
          role: 'Software Engineer New Grad (2026)',
          resumeUrl: 'https://drive.google.com/file/d/sample-resume.pdf',
          note: 'Graduating top of class with multiple hackathon wins and verified open source contributions.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.referral.status).toBe('pending');
      referralId = res.body.data.referral._id;
    });

    it('PATCH /api/mentorship/referrals/:id allows alumni to submit referral confirmation', async () => {
      const res = await request(app)
        .patch(`/api/mentorship/referrals/${referralId}`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({
          status: 'referred',
          feedback: 'Submitted internal referral link via Stripe Workday portal. Best of luck!',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.referral.status).toBe('referred');
    });
  });
});

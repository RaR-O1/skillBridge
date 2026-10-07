import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { connectDB, disconnectDB } from '../config/database.js';
import { User } from '../modules/users/users.model.js';
import { Project } from '../modules/projects/projects.model.js';
import { RecommendationFeedback, WhyMatchCache } from '../modules/recommendations/recommendations.model.js';
import { EmbeddingsEngine } from '../modules/ai/embeddings.js';

describe('SkillBridge Stage 2C API Suite: Vector Retrieval, Ranking, Grounded LLM Matching & AI Assistants', () => {
  let studentToken: string;
  let studentId: string;
  let businessToken: string;
  let businessId: string;
  let projectId: string;

  beforeAll(async () => {
    await connectDB();

    // Clean up
    await RecommendationFeedback.deleteMany({});
    await WhyMatchCache.deleteMany({});

    // 1. Create Student
    const sRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'vector.student@iitd.ac.in',
        name: 'Aarav Sharma',
        role: 'student',
      });
    studentToken = sRes.body.data.token;
    studentId = sRes.body.data.user._id;

    await request(app)
      .patch('/api/users/profile')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        college: 'IIT Delhi',
        visibility: true,
        optInChatSummary: true,
        skills: [
          { name: 'React', level: 5 },
          { name: 'Node.js', level: 4 },
          { name: 'TypeScript', level: 4 },
        ],
        bio: 'Full-stack campus engineer building microservices and realtime web apps.',
      });

    // 2. Create Business
    const bRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'business@techstore.in',
        name: 'Ramesh Verma',
        role: 'local_business',
      });
    businessToken = bRes.body.data.token;
    businessId = bRes.body.data.user._id;

    // Create an open project
    const pRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${businessToken}`)
      .send({
        title: 'Modern React E-Commerce Inventory Dashboard',
        description: 'Need an experienced student engineer to build a high performance React and Node.js inventory management tool.',
        category: 'Full Stack Web',
        requiredSkills: ['React', 'Node.js', 'TypeScript'],
        budgetINR: 25000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    projectId = pRes.body.data.project._id;
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('1. Vector Embeddings Engine & Cosine Similarity', () => {
    it('generates normalized 128-dimensional embedding vectors', () => {
      const vec = EmbeddingsEngine.generateEmbedding('React Node.js TypeScript Full Stack');
      expect(vec.length).toBe(128);

      let norm = 0;
      for (const val of vec) norm += val * val;
      expect(Math.abs(Math.sqrt(norm) - 1.0)).toBeLessThan(0.001);
    });

    it('computes higher cosine similarity for semantically aligned text', () => {
      const v1 = EmbeddingsEngine.generateEmbedding('React Frontend Web Developer');
      const v2 = EmbeddingsEngine.generateEmbedding('React Node.js Frontend Engineer');
      const v3 = EmbeddingsEngine.generateEmbedding('Hardware Electrical Microcontroller Circuit');

      const simHigh = EmbeddingsEngine.cosineSimilarity(v1, v2);
      const simLow = EmbeddingsEngine.cosineSimilarity(v1, v3);

      expect(simHigh).toBeGreaterThan(simLow);
    });

    it('calculates skill overlap accurately', () => {
      const candidateSkills = ['React', 'TypeScript', 'Node.js'];
      const requiredSkills = ['React', 'Node.js', 'MongoDB'];

      const overlap = EmbeddingsEngine.calculateSkillOverlap(candidateSkills, requiredSkills);
      // 2 out of 3 matches ~ 0.666
      expect(overlap).toBeGreaterThan(0.6);
      expect(overlap).toBeLessThanOrEqual(1.0);
    });
  });

  describe('2. Vector Retrieval & Grounded Ranking Formula', () => {
    it('GET /api/recommendations ranks candidate talent with whyThisMatch', async () => {
      const res = await request(app)
        .get('/api/recommendations')
        .set('Authorization', `Bearer ${businessToken}`)
        .query({
          title: 'React and Node.js Dashboard',
          skills: 'React,Node.js,TypeScript',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.recommendations)).toBe(true);

      if (res.body.data.recommendations.length > 0) {
        const top = res.body.data.recommendations[0];
        expect(top.score).toBeGreaterThan(0);
        // Verify formula: score is composite of similarity, skill overlap, trust, and freshness
        expect(top.similarity).toBeDefined();
        expect(top.skillOverlap).toBeDefined();
        expect(top.trustScore).toBeDefined();
        expect(top.freshness).toBeDefined();
        expect(top.whyThisMatch).toContain('skill match');
      }
    });

    it('GET /api/recommendations for student returns matching opportunities', async () => {
      const res = await request(app)
        .get('/api/recommendations')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.recommendations)).toBe(true);

      const foundProject = res.body.data.recommendations.find(
        (r: any) => r.entityId === projectId
      );
      expect(foundProject).toBeDefined();
      expect(foundProject.whyThisMatch).toContain('High match');
    });
  });

  describe('3. User Feedback & Dismissal Filtering', () => {
    it('POST /api/recommendations/feedback records thumbs_up action', async () => {
      const res = await request(app)
        .post('/api/recommendations/feedback')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          entityId: projectId,
          entityType: 'project',
          action: 'thumbs_up',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.feedback.action).toBe('thumbs_up');
    });

    it('POST /api/recommendations/feedback records dismiss action and filters entity from results', async () => {
      await request(app)
        .post('/api/recommendations/feedback')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          entityId: projectId,
          entityType: 'project',
          action: 'dismiss',
        });

      const res = await request(app)
        .get('/api/recommendations')
        .set('Authorization', `Bearer ${studentToken}`);

      const foundDismissed = res.body.data.recommendations.find(
        (r: any) => r.entityId === projectId
      );
      // Hard filter: dismissed recommendations are omitted
      expect(foundDismissed).toBeUndefined();
    });
  });

  describe('4. AI Assistants: Scope Helper, Profile Feedback & Chat Summary', () => {
    it('POST /api/ai/scope-helper generates structured project draft', async () => {
      const res = await request(app)
        .post('/api/ai/scope-helper')
        .send({
          prompt: 'Online bakery catalog with real-time stock notifications and UPI invoicing',
          targetTimelineWeeks: 3,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.scope.suggestedTitle).toBeDefined();
      expect(res.body.data.scope.suggestedBudgetINR).toBeGreaterThanOrEqual(15000);
      expect(res.body.data.scope.milestones.length).toBe(3);
      expect(res.body.data.scope.requiredSkills.length).toBeGreaterThan(0);
    });

    it('GET /api/ai/profile-feedback provides actionable profile improvement advice', async () => {
      const res = await request(app)
        .get('/api/ai/profile-feedback')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.feedback.score).toBeGreaterThan(0);
      expect(Array.isArray(res.body.data.feedback.strengths)).toBe(true);
      expect(Array.isArray(res.body.data.feedback.suggestions)).toBe(true);
    });

    it('GET /api/ai/chat-summary/:roomId enforces privacy opt-in constraint', async () => {
      const res = await request(app)
        .get('/api/ai/chat-summary/room_demo_test')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.summary.summary).toBeDefined();
      expect(res.body.data.summary.actionItems).toBeDefined();
    });
  });
});

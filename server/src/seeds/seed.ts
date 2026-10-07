import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/database.js';
import { User } from '../modules/users/users.model.js';
import { Team, TeamApplication } from '../modules/teams/teams.model.js';
import { Project, ProjectApplication } from '../modules/projects/projects.model.js';
import { Agreement } from '../modules/agreements/agreements.model.js';
import { PortfolioItem, Review } from '../modules/portfolio/portfolio.model.js';
import { Report } from '../modules/reports/reports.model.js';
import { AuditLog } from '../modules/admin/admin.model.js';
import { Notification } from '../modules/notifications/notifications.model.js';
import { Company, Job, JobApplication } from '../modules/jobs/jobs.model.js';
import { Startup, StartupApplication, CoFounderProfile } from '../modules/startups/startups.model.js';
import { MentorProfile, MentorshipSession, LearningResource, AlumniReferral } from '../modules/mentorship/mentorship.model.js';
import { RecommendationFeedback, WhyMatchCache } from '../modules/recommendations/recommendations.model.js';
import { logger } from '../config/logger.js';

async function seed() {
  logger.info('Starting SkillBridge database seeding...');
  await connectDB();

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Team.deleteMany({}),
    TeamApplication.deleteMany({}),
    Project.deleteMany({}),
    ProjectApplication.deleteMany({}),
    Agreement.deleteMany({}),
    PortfolioItem.deleteMany({}),
    Review.deleteMany({}),
    Report.deleteMany({}),
    AuditLog.deleteMany({}),
    Notification.deleteMany({}),
    Company.deleteMany({}),
    Job.deleteMany({}),
    JobApplication.deleteMany({}),
    Startup.deleteMany({}),
    StartupApplication.deleteMany({}),
    CoFounderProfile.deleteMany({}),
    MentorProfile.deleteMany({}),
    MentorshipSession.deleteMany({}),
    LearningResource.deleteMany({}),
    AlumniReferral.deleteMany({}),
    RecommendationFeedback.deleteMany({}),
    WhyMatchCache.deleteMany({}),
  ]);

  logger.info('Purged existing records. Creating seed users for each role...');

  // 1. Seed Student 1: Aarav Sharma (Verified IIT Delhi)
  const aarav = await User.create({
    uid: 'student-aarav-uid-01',
    email: 'aarav.sharma@iitd.ac.in',
    name: 'Aarav Sharma',
    role: 'student',
    college: 'Indian Institute of Technology Delhi',
    collegeEmail: 'aarav.sharma@iitd.ac.in',
    collegeVerified: true,
    bio: 'Full-stack developer passionate about building scalable web apps and hackathon products.',
    skills: [
      { name: 'React', level: 5, verified: true },
      { name: 'TypeScript', level: 4, verified: true },
      { name: 'Node.js', level: 4, verified: true },
      { name: 'Tailwind CSS', level: 5, verified: true },
    ],
    trustScore: 98,
    visibility: true,
  });

  // 2. Seed Student 2: Priya Patel (Verified Delhi University)
  const priya = await User.create({
    uid: 'student-priya-uid-02',
    email: 'priya.patel@du.ac.in',
    name: 'Priya Patel',
    role: 'student',
    college: 'Delhi University',
    collegeEmail: 'priya.patel@du.ac.in',
    collegeVerified: true,
    bio: 'Data scientist and machine learning enthusiast. Winner of 3 inter-college hackathons.',
    skills: [
      { name: 'Python', level: 5, verified: true },
      { name: 'Machine Learning', level: 4, verified: true },
      { name: 'FastAPI', level: 4, verified: true },
      { name: 'PostgreSQL', level: 3, verified: true },
    ],
    trustScore: 94,
    visibility: true,
  });

  // 3. Seed Local Business: Kaveri Bakery
  const kaveriBiz = await User.create({
    uid: 'biz-kaveri-uid-03',
    email: 'owner@kaveribakery.com',
    name: 'Ramesh Verma',
    role: 'local_business',
    businessName: 'Kaveri Artisan Bakery & Cafe',
    businessVerified: true,
    bio: 'Family-owned bakery operating across 3 branches in South Delhi.',
    trustScore: 96,
  });

  // 4. Seed Company / Recruiter: TechSprint
  const recruiter = await User.create({
    uid: 'recruiter-techsprint-uid-04',
    email: 'careers@techsprint.io',
    name: 'Siddharth Rao',
    role: 'company',
    businessName: 'TechSprint Software Labs',
    businessVerified: true,
    bio: 'Talent Acquisition Partner connecting top campus engineering talent with enterprise projects.',
    trustScore: 95,
  });

  // 5. Seed Startup Founder: NexusAI
  const startupFounder = await User.create({
    uid: 'startup-nexus-uid-05',
    email: 'ananya@nexusai.dev',
    name: 'Ananya Sen',
    role: 'startup',
    businessName: 'NexusAI Health',
    businessVerified: true,
    bio: 'Building AI copilots for diagnostic radiology clinics. Seed funded.',
    trustScore: 92,
  });

  // 6. Seed Mentor / Alumni: Vikram Nair
  const mentor = await User.create({
    uid: 'mentor-vikram-uid-06',
    email: 'vikram.nair@alumni.iitd.ac.in',
    name: 'Vikram Nair',
    role: 'mentor',
    college: 'IIT Delhi Alumni (Class of 2020)',
    collegeVerified: true,
    bio: 'Staff Engineer at Stripe. Former hackathon organizer and mentor to 40+ student engineers.',
    skills: [
      { name: 'System Design', level: 5, verified: true },
      { name: 'Distributed Systems', level: 5, verified: true },
    ],
    trustScore: 99,
  });

  // 7. Seed Admin: SkillBridge Admin
  const admin = await User.create({
    uid: 'admin-super-uid-07',
    email: 'admin@skillbridge.edu',
    name: 'SkillBridge Admin',
    role: 'admin',
    businessVerified: true,
    trustScore: 100,
  });

  logger.info('Created all 7 users covering every role.');

  // Seed Portfolio Items for Aarav
  await PortfolioItem.create([
    {
      userId: aarav._id,
      title: 'DevPulse - Collaborative Code Reviewer',
      description: 'Real-time collaborative code review workspace with automated AST analysis and AST highlighting.',
      projectUrl: 'https://devpulse.example.com',
      repoUrl: 'https://github.com/aaravsharma/devpulse',
      skills: ['React', 'TypeScript', 'WebSockets'],
      featured: true,
    },
    {
      userId: aarav._id,
      title: 'CampusRide - University Carpooling',
      description: 'P2P verified student carpooling network built for daily commuters between campuses.',
      projectUrl: 'https://campusride.example.com',
      skills: ['React', 'Tailwind CSS', 'Node.js'],
      featured: false,
    },
  ]);

  // Seed Hackathon Team
  const teamDeadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days ahead
  const team = await Team.create({
    title: 'Smart India Hackathon: AI Green Energy Grid',
    description: 'Looking for a skilled backend and ML engineer to build smart solar distribution forecasts.',
    hackathonName: 'Smart India Hackathon 2026',
    ownerId: aarav._id,
    skillsNeeded: ['Python', 'FastAPI', 'Machine Learning', 'React'],
    teamSize: 3,
    members: [aarav._id, priya._id],
    deadline: teamDeadline,
    status: 'open',
    chatRoomId: 'team_sih_energy_grid',
  });

  await TeamApplication.create({
    teamId: team._id,
    applicantId: priya._id,
    note: 'Excited about green energy forecasting! I have built LSTM models for weather data.',
    status: 'accepted',
  });

  // Seed Freelance Project 1 (Completed with mutual Price Agreement & Payment received confirmation)
  const project1Deadline = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const project1 = await Project.create({
    title: 'Artisan Bakery Catalog & Online Pre-Order Menu',
    description: 'Design and build a responsive mobile-friendly menu catalog with WhatsApp order integration and weekly menu highlights for our 3 bakery branches.',
    category: 'Web Development',
    requiredSkills: ['React', 'Tailwind CSS', 'Responsive Design'],
    budgetINR: 18000,
    deadline: project1Deadline,
    ownerId: kaveriBiz._id,
    assignedStudentId: aarav._id,
    status: 'completed',
    paymentReceivedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    chatRoomId: 'project_kaveri_bakery_01',
    submission: {
      workUrl: 'https://kaveri-bakery-preview.vercel.app',
      notes: 'Completed all requirements including responsive mobile menus and WhatsApp checkout link integration.',
      submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  // Seed Agreement for Project 1
  const agreement1 = await Agreement.create({
    projectId: project1._id,
    ownerId: kaveriBiz._id,
    studentId: aarav._id,
    amountINR: 18000,
    paymentMethodNote: 'Direct UPI transfer to student upon approval',
    businessConfirmed: true,
    businessConfirmedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    studentConfirmed: true,
    studentConfirmedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    paymentReceived: true,
    paymentReceivedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  });

  project1.agreementId = agreement1._id;
  await project1.save();

  // Seed Unlocked Review for Project 1
  await Review.create({
    targetUserId: aarav._id,
    authorId: kaveriBiz._id,
    projectId: project1._id,
    rating: 5,
    comment: 'Aarav did an outstanding job! He understood our business requirements immediately and delivered clean, fast code. Highly recommended!',
  });

  // Seed Freelance Project 2 (Open for students to apply)
  const project2Deadline = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);
  await Project.create({
    title: 'Cafe Inventory Tracking & Vendor Order Dashboard',
    description: 'Looking for a student developer to build a modern React inventory dashboard with stock alerts, ingredient cost tracking, and PDF weekly export.',
    category: 'Full Stack Web',
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'Tailwind CSS'],
    budgetINR: 24000,
    deadline: project2Deadline,
    ownerId: kaveriBiz._id,
    status: 'open',
    chatRoomId: 'project_kaveri_bakery_02',
  });

  // Seed a sample Report for Admin Queue
  await Report.create({
    reporterId: kaveriBiz._id,
    targetUserId: priya._id,
    category: 'other',
    description: 'Inquiry regarding campus marketing poster copyright permissions for student event.',
    status: 'pending',
  });

  // Seed Companies (Stage 2A)
  const techSprintCo = await Company.create({
    name: 'TechSprint Software Labs',
    domain: 'techsprint.io',
    description: 'Enterprise developer productivity and cloud tooling engineering partner.',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
    verified: true,
    verifiedAt: new Date(),
    members: [recruiter._id],
  });

  const nexusAiCo = await Company.create({
    name: 'NexusAI Health',
    domain: 'nexusai.dev',
    description: 'AI diagnostic copilots for clinical radiology workflows.',
    logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150',
    verified: false, // Pending verification in admin queue
    members: [startupFounder._id],
  });

  // Seed Jobs (Stage 2A)
  const job1 = await Job.create({
    companyId: techSprintCo._id,
    postedById: recruiter._id,
    title: 'Full Stack Engineering Intern',
    type: 'internship',
    location: 'Hybrid / Bangalore or Remote',
    isRemote: true,
    stipendINR: 25000,
    requiredSkills: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    description: 'Join our campus sprint team to design and deploy modern web features for enterprise engineering teams.',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'open',
  });

  const job2 = await Job.create({
    companyId: nexusAiCo._id,
    postedById: startupFounder._id,
    title: 'Machine Learning Research Intern',
    type: 'internship',
    location: 'Remote',
    isRemote: true,
    stipendINR: 30000,
    requiredSkills: ['Python', 'FastAPI', 'PyTorch'],
    description: 'Collaborate with clinical founders to train vision algorithms on curated imaging datasets.',
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    status: 'open',
  });

  // Seed Job Applications & Recruiter Pipeline (Stage 2A)
  await JobApplication.create({
    jobId: job1._id,
    studentId: priya._id,
    note: 'Excited about developer productivity tooling! Winner of 3 hackathons with strong React & Node experience.',
    stage: 'interview',
    notes: [
      {
        authorId: recruiter._id,
        text: 'Top candidate: aced the technical assignment. Scheduled for founder chat.',
        createdAt: new Date(),
      },
    ],
  });

  await JobApplication.create({
    jobId: job1._id,
    studentId: aarav._id,
    note: 'Building full-stack campus tools with 98 trust score and IIT Delhi verification.',
    stage: 'shortlisted',
  });

  // Seed Startups & Open Roles (Stage 2B)
  const nexusStartup = await Startup.create({
    name: 'NexusAI Health',
    pitch: 'AI copilots for diagnostic radiology clinics',
    description: 'Transforming clinical workflows with multimodal vision models that reduce radiology turnaround time by 60%. Seed funded by Peak XV.',
    stage: 'early_traction',
    website: 'https://nexusai.dev',
    founders: [startupFounder._id],
    verified: true,
    openRoles: [
      {
        roleTitle: 'Founding ML Engineer',
        roleType: 'co_founder',
        requiredSkills: ['PyTorch', 'Computer Vision', 'Python', 'FastAPI'],
        equityOrStipend: '1.5% - 3.5% Equity + ₹45,000/mo',
        description: 'Lead design and fine-tuning of medical imaging transformer models.',
        status: 'open',
        createdAt: new Date(),
      },
      {
        roleTitle: 'Frontend Engineering Intern',
        roleType: 'intern',
        requiredSkills: ['React', 'TypeScript', 'Tailwind CSS'],
        equityOrStipend: '₹25,000/mo stipend',
        description: 'Build fast, responsive diagnostic viewer UI in React.',
        status: 'open',
        createdAt: new Date(),
      },
    ],
  });

  // Seed Co-Founder Pool (Stage 2B)
  await CoFounderProfile.create({
    userId: aarav._id,
    college: 'IIT Delhi',
    bio: 'Passionate full-stack developer with 3 hackathon wins looking to partner with a technical domain specialist in AI/EdTech.',
    skills: ['React', 'Node.js', 'System Architecture', 'Product Design'],
    idealCoFounderRole: 'AI / Machine Learning Co-Founder',
    targetIndustry: 'EdTech / DevTools',
    hoursPerWeek: 25,
    lookingFor: 'Seeking an ML researcher to co-found a real-time developer education platform.',
    active: true,
  });

  // Seed Mentor Profile (Stage 2B)
  await MentorProfile.create({
    mentorId: mentor._id,
    currentCompany: 'Stripe',
    jobTitle: 'Staff Software Engineer',
    yearsExperience: 6,
    bio: 'Alumnus of IIT Delhi. Specialized in high-throughput distributed payment pipelines, API architecture, and engineering leadership.',
    college: 'IIT Delhi',
    collegeVerified: true,
    areasOfExpertise: ['Distributed Systems', 'System Design', 'API Design', 'Career Growth'],
    hourlyAvailability: ['Wed 7:00 PM - 9:00 PM IST', 'Sat 10:00 AM - 1:00 PM IST'],
    rating: 4.95,
    reviewCount: 18,
    sessionsCount: 32,
    maxMentees: 5,
  });

  // Seed Mentorship Session (Stage 2B)
  await MentorshipSession.create({
    studentId: aarav._id,
    mentorId: mentor._id,
    topic: 'Transitioning from Hackathons to Production Distributed Architecture',
    notes: 'Looking for advice on scaling database sharding and caching for high-load systems.',
    status: 'confirmed',
    proposedTimes: [new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)],
    confirmedTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    meetingLink: 'https://meet.google.com/sb-mentor-session',
    chatRoomId: `session-${aarav._id}-${mentor._id}`,
  });

  // Seed Learning Resources (Stage 2B)
  await LearningResource.create([
    {
      title: 'Distributed Systems Patterns & Microservices Guide',
      category: 'system_design',
      url: 'https://martinfowler.com/articles/patterns-of-distributed-systems/',
      description: 'Definitive guide to consensus protocols, write-ahead logs, and event sourcing.',
      tags: ['System Design', 'Backend', 'Architecture'],
      addedById: mentor._id,
    },
    {
      title: 'Full-Stack TypeScript SaaS Architecture Blueprint',
      category: 'backend',
      url: 'https://github.com/alan2207/bulletproof-react',
      description: 'Enterprise React & Node.js repository architecture for maintainable full-stack apps.',
      tags: ['React', 'TypeScript', 'Clean Code'],
      addedById: mentor._id,
    },
  ]);

  // Seed Alumni Referral Request (Stage 2B)
  await AlumniReferral.create({
    mentorId: mentor._id,
    studentId: priya._id,
    companyName: 'Stripe',
    role: 'Software Engineer Intern (Data & ML Infrastructure)',
    resumeUrl: 'https://priyapatel.dev/resume.pdf',
    note: 'Hi Vikram, I loved your talk at IIT Delhi! I have built open-source ML pipelines and would love an introduction to the ML Infra team.',
    status: 'referred',
    feedback: 'Referred to hiring manager in Bangalore tech team! Keep an eye on your email.',
  });

  // Seed Initial Audit Logs
  await AuditLog.create([
    {
      adminId: admin._id.toString(),
      adminEmail: admin.email,
      action: 'SYSTEM_BOOTSTRAP',
      targetType: 'System',
      targetId: 'platform',
      details: { environment: 'development', version: '2.0.0' },
    },
    {
      adminId: admin._id.toString(),
      adminEmail: admin.email,
      action: 'VERIFY_COLLEGE_APPROVED',
      targetType: 'User',
      targetId: aarav._id.toString(),
      details: { approved: true, type: 'college', domain: 'iitd.ac.in' },
    },
  ]);

  logger.info('Database successfully seeded with realistic sample data across all roles!');
  await disconnectDB();
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error({ err }, 'Seeding failed');
    process.exit(1);
  });

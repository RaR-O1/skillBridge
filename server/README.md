# SkillBridge Server (Modular Monolith)

Express + TypeScript + Mongoose + Zod + Socket.io backend structured as clean domain modules.

## Module Structure
- `modules/auth`: Onboarding, dev login, 6-digit institutional college email verification
- `modules/users`: Profiles, public profiles, talent search with recruiter visibility filters
- `modules/portfolio`: Portfolio projects CRUD, verified reviews unlocked upon payment
- `modules/teams`: Hackathon squads, skill filtering, applicant approval, auto-close logic
- `modules/projects`: Freelance projects in INR, proposals, deliverables, approvals
- `modules/agreements`: Mutual Price Agreement recording, dual confirmations, payment received
- `modules/chat`: Real-time room messaging (team & project workspaces), URL attachments
- `modules/notifications`: In-app & real-time socket notification dispatch
- `modules/reports`: Problem reports ("Payment not received", spam, harassment)
- `modules/admin`: College & business verification queue, user moderation (warn/suspend/ban), audit logs
- `modules/jobs, startups, mentorship, recommendations, ai`: Phase 2 feature-flagged stubs

## Testing
```bash
npm test
```

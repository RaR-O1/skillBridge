# SkillBridge Background Worker

BullMQ + Redis background worker handling:
- Auto-closing hackathon squads when deadlines expire or capacity is reached
- Email notifications dispatch via Nodemailer / SMTP
- Embeddings indexing jobs (Phase 2C vector search prep)
- Periodic in-process fallback scheduler when running without local Redis

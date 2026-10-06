import { Router } from 'express';
import { PortfolioController } from './portfolio.controller.js';
import { validateBody } from '../../middleware/validate.js';
import { createPortfolioItemSchema, updatePortfolioItemSchema, createReviewSchema } from './portfolio.validation.js';
import { requireAuth } from '../../middleware/auth.js';

export const portfolioRouter = Router();

portfolioRouter.get('/me', requireAuth, PortfolioController.getMyPortfolio);
portfolioRouter.post('/items', requireAuth, validateBody(createPortfolioItemSchema), PortfolioController.addItem);
portfolioRouter.put('/items/:id', requireAuth, validateBody(updatePortfolioItemSchema), PortfolioController.updateItem);
portfolioRouter.delete('/items/:id', requireAuth, PortfolioController.deleteItem);

// Review submission (with project payment unlock validation)
portfolioRouter.post('/reviews', requireAuth, validateBody(createReviewSchema), PortfolioController.createReview);

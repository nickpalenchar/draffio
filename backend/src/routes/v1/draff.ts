import { Router } from 'express';
import { createId } from '@paralleldrive/cuid2';
import { Draff } from '../../db/entities/Draff';

const draffRouter = Router();

interface CreateDraffBody {
  code: string;
  language?: string;
  title?: string;
}

async function generateUniqueTitle(authorId: string): Promise<string> {
  // First try with 3 digits
  let digits = 3;
  let attempts = 0;
  const maxAttempts = 6;

  while (attempts < maxAttempts) {
    const randomNum = Math.floor(Math.random() * Math.pow(10, digits))
      .toString()
      .padStart(digits, '0');
    
    const title = `tmp-${randomNum}`;
    
    // Check if title exists for this author
    const existing = await Draff.query
      .byAuthor({ authorId })
      .go();
    
    const titleExists = existing.data.some(draff => draff.title === title);
    
    if (!titleExists) {
      return title;
    }

    digits++; // Try with one more digit
    attempts++;
  }

  // If all attempts fail, use timestamp
  return `tmp-${Date.now()}`;
}

draffRouter.post('/', async (req, res, next) => {
  try {
    const { code, language, title: providedTitle } = req.body as CreateDraffBody;

    if (!code) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Code is required'
      });
    }

    // User is guaranteed to exist due to authMiddleware
    const authorId = req.user!.userId;

    // Generate title if not provided
    const title = providedTitle || await generateUniqueTitle(authorId);

    const draff = await Draff.create({
      draffId: createId(),
      authorId,
      code,
      language: language || 'javascript',
      title,
    }).go();

    res.status(201).json(draff.data);
  } catch (error) {
    next(error);
  }
});

export default draffRouter; 
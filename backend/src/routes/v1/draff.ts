import { Router } from 'express';
import { createId } from '@paralleldrive/cuid2';
import { Draff } from '../../db/entities/Draff';
import { User } from '../../db/entities/User';

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

    const authorId = req.user!.userId;
    const username = req.user!.username;  // Get username from auth middleware

    const title = providedTitle || await generateUniqueTitle(authorId);

    const draff = await Draff.create({
      draffId: createId(),
      authorId,
      code,
      language: language || 'javascript',
      title,
    }).go();

    // Include username in response
    res.status(201).json({
      ...draff.data,
      username
    });
  } catch (error) {
    next(error);
  }
});

draffRouter.get('/:username/:title', async (req, res, next) => {
  try {
    const { username, title } = req.params;
    console.log('username', username);
    console.log('title', title);  
    const normalizedUsername = username.startsWith('@') ? username.slice(1) : username;
    // First find the user by username
    const users = await User.query
      .byUsername({ username: normalizedUsername })
      .go();

    if (users.data.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    const authorId = users.data[0].userId;

    // Then find their draff with matching title
    const draffs = await Draff.query
      .byAuthor({ authorId })
      .go();

    const draff = draffs.data.find(d => d.title === title);

    if (!draff) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Draff not found'
      });
    }

    res.json(draff);
  } catch (error) {
    next(error);
  }
});

export default draffRouter; 
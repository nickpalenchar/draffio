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

draffRouter.get('/user/self', async (req, res, next) => {
  console.log('draffRouter.get(/user/self)');
  try {
    const authorId = req.user!.userId;
    const username = req.user!.username;

    const draffs = await Draff.query
      .byAuthor({ authorId })
      .go();

    const mappedDraffs = draffs.data
      .map(draff => ({
        title: draff.title,
        language: draff.language,
        updatedAt: draff.updatedAt,
        author: username
      }))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    res.json(mappedDraffs);
  } catch (error) {
    next(error);
  }
});

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

draffRouter.put('/:username/:title', async (req, res, next) => {
  try {
    const { username, title } = req.params;
    const { code, language } = req.body;
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

    // Verify the logged-in user owns this draff
    if (users.data[0].userId !== req.user!.userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only edit your own draffs'
      });
    }

    // Find and update the draff
    const draffs = await Draff.query
      .byAuthor({ authorId: users.data[0].userId })
      .go();

    const draff = draffs.data.find(d => d.title === title);

    if (!draff) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Draff not found'
      });
    }

    const updated = await Draff.update({
      draffId: draff.draffId
    })
    .set({
      code,
      language: language || draff.language,
    })
    .go();

    res.json({
      ...updated.data,
      username: normalizedUsername,
      title: draff.title
    });
  } catch (error) {
    next(error);
  }
});

draffRouter.patch('/:username/:title/rename', async (req, res, next) => {
  try {
    const { username, title } = req.params;
    const { newTitle } = req.body;
    const normalizedUsername = username.startsWith('@') ? username.slice(1) : username;

    if (!newTitle) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'New title is required'
      });
    }

    if (newTitle.length > 65) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Title cannot be longer than 65 characters'
      });
    }

    // Validate title format
    if (!/^[a-zA-Z0-9._-]+$/.test(newTitle)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Title can only contain letters, numbers, dots, hyphens and underscores'
      });
    }

    const users = await User.query
      .byUsername({ username: normalizedUsername })
      .go();

    if (users.data.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    if (users.data[0].userId !== req.user!.userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only rename your own draffs'
      });
    }

    const draffs = await Draff.query
      .byAuthor({ authorId: users.data[0].userId })
      .go();

    const draff = draffs.data.find(d => d.title === title);

    if (!draff) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Draff not found'
      });
    }

    const titleExists = draffs.data.some(d => d.title === newTitle);
    if (titleExists) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A draff with this title already exists'
      });
    }

    const updated = await Draff.update({
      draffId: draff.draffId
    })
    .set({
      title: newTitle
    })
    .go();

    res.json({
      ...updated.data,
      username: normalizedUsername,
      title: newTitle
    });
  } catch (error) {
    next(error);
  }
});

draffRouter.delete('/:username/:title', async (req, res, next) => {
  try {
    const { username, title } = req.params;
    const normalizedUsername = username.startsWith('@') ? username.slice(1) : username;

    const users = await User.query
      .byUsername({ username: normalizedUsername })
      .go();

    if (users.data.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    if (users.data[0].userId !== req.user!.userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own draffs'
      });
    }

    const draffs = await Draff.query
      .byAuthor({ authorId: users.data[0].userId })
      .go();

    const draff = draffs.data.find(d => d.title === title);

    if (!draff) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Draff not found'
      });
    }

    await Draff.delete({
      draffId: draff.draffId
    }).go();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default draffRouter;
import Category from '../models/Category.js';
import Thread from '../models/Thread.js';
import Reply from '../models/Reply.js';

// --- Categories ---

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const slug =
      req.body.slug ||
      (name
        ? name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
        : undefined);

    const category = await Category.create({ name, description, slug });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// --- Threads ---

export const getThreads = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const threads = await Thread.find(filter)
      .populate('author', 'username')
      .populate('category', 'name');
    res.json(threads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getThreadById = async (req, res) => {
  try {
    // Atomically increment views and return the updated document
    const thread = await Thread.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'username')
      .populate('category', 'name');

    if (!thread) return res.status(404).json({ message: 'Thread not found' });

    res.json(thread);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createThread = async (req, res) => {
  try {
    const { author, ...threadData } = req.body;
    const thread = await Thread.create({ ...threadData, author: req.user._id });
    res.status(201).json(thread);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const upvoteThread = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: 'Thread not found' });

    const userId = req.user._id;
    const hasUpvoted = thread.upvotedBy.includes(userId);

    if (hasUpvoted) {
      thread.upvotedBy.pull(userId);
      thread.upvotes = Math.max(0, thread.upvotes - 1);
    } else {
      thread.upvotedBy.push(userId);
      thread.upvotes += 1;
    }

    await thread.save();
    res.json(thread);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Replies ---

export const getRepliesByThreadId = async (req, res) => {
  try {
    const threadId = req.params.threadId || req.params.id;
    const replies = await Reply.find({ thread: threadId }).populate('author', 'username');
    res.json(replies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createReply = async (req, res) => {
  try {
    const { author, ...replyData } = req.body;
    const reply = await Reply.create({ ...replyData, author: req.user._id });
    res.status(201).json(reply);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const upvoteReply = async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.id);
    if (!reply) return res.status(404).json({ message: 'Reply not found' });

    const userId = req.user._id;
    const hasUpvoted = reply.upvotedBy.includes(userId);

    if (hasUpvoted) {
      reply.upvotedBy.pull(userId);
      reply.upvotes = Math.max(0, reply.upvotes - 1);
    } else {
      reply.upvotedBy.push(userId);
      reply.upvotes += 1;
    }

    await reply.save();
    res.json(reply);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
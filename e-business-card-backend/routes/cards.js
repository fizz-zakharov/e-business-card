const express = require('express');
const Card = require('../models/Card');
const auth = require('../middlewares/auth');

const router = express.Router();

// @route   GET /api/cards
// @desc    Get all cards (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const cards = await Card.find().populate('userId', 'name').sort({ createdAt: -1 });
    res.json(cards);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/cards/my
// @desc    Get current user's cards
// @access  Private
router.get('/my', auth, async (req, res) => {
  try {
    const cards = await Card.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(cards);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/cards
// @desc    Create a new card
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, linkedin, github, twitter } = req.body;

    const newCard = new Card({
      userId: req.user.id,
      name,
      email,
      linkedin,
      github,
      twitter
    });

    const card = await newCard.save();
    await card.populate('userId', 'name');
    
    res.json(card);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/cards/:id
// @desc    Get card by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const card = await Card.findById(req.params.id).populate('userId', 'name');
    
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    res.json(card);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Card not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/cards/:id
// @desc    Update a card
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email, linkedin, github, twitter } = req.body;

    let card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Make sure user owns the card
    if (card.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    card = await Card.findByIdAndUpdate(
      req.params.id,
      { name, email, linkedin, github, twitter },
      { new: true }
    );

    await card.populate('userId', 'name');
    res.json(card);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Card not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/cards/:id
// @desc    Delete a card
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Make sure user owns the card
    if (card.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Card.findByIdAndDelete(req.params.id);
    res.json({ message: 'Card removed' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Card not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
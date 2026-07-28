import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { Equipment, Review, User } from '../models.js';
import { authMiddleware } from './authMiddleware.js';

const router = express.Router();

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config for Equipment Multiple Images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// GET all equipment with filters
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, location, availability, search } = req.query;
    
    let query = {};
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (availability !== undefined && availability !== '') {
      query.availability = availability === 'true';
    }
    
    if (search) {
      query.$or = [
        { equipmentName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const equipmentList = await Equipment.find(query).populate('ownerId', 'name email mobile village');
    res.json(equipmentList);
  } catch (error) {
    console.error('Fetch equipment error:', error);
    res.status(500).json({ message: 'Error retrieving equipment' });
  }
});

// GET AI-based Recommendations for a Farmer
router.get('/recommendations', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    // Recommendations algorithm:
    // 1. Matches equipment in the same village/location
    // 2. High-rated equipment
    // 3. Fallback to featured listings
    let recommended = await Equipment.find({
      location: { $regex: user.village || '', $options: 'i' },
      availability: true
    }).populate('ownerId', 'name mobile').limit(4);

    if (recommended.length < 2) {
      // Find high rating items
      const backup = await Equipment.find({ availability: true })
        .sort({ rating: -1 })
        .populate('ownerId', 'name mobile')
        .limit(4);
      
      // Combine and filter unique
      const combined = [...recommended, ...backup];
      const seen = new Set();
      recommended = combined.filter(item => {
        const id = item._id.toString();
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      }).slice(0, 4);
    }

    res.json(recommended);
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ message: 'Error loading recommendations' });
  }
});

// GET single equipment details
router.get('/:id', async (req, res) => {
  try {
    const item = await Equipment.findById(req.params.id).populate('ownerId', 'name email mobile village profileImage');
    if (!item) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    const reviews = await Review.find({ equipmentId: item._id }).sort({ createdAt: -1 });
    res.json({ item, reviews });
  } catch (error) {
    console.error('Fetch equipment detail error:', error);
    res.status(500).json({ message: 'Error retrieving details' });
  }
});

// POST Add new equipment (Owner only)
router.post('/', authMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    if (req.user.role !== 'Equipment Owner' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only equipment owners can add equipment' });
    }

    const { equipmentName, category, description, pricePerDay, location } = req.body;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    } else if (req.body.images) {
      imageUrls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    const newItem = new Equipment({
      equipmentName,
      category,
      description,
      pricePerDay: Number(pricePerDay),
      location,
      availability: true,
      images: imageUrls,
      ownerId: req.user._id
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Add equipment error:', error);
    res.status(500).json({ message: 'Error adding equipment' });
  }
});

// PUT Edit equipment (Owner only)
router.put('/:id', authMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    let item = await Equipment.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    if (item.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to modify this equipment' });
    }

    const { equipmentName, category, description, pricePerDay, location, availability } = req.body;

    let imageUrls = item.images;
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    } else if (req.body.images) {
      imageUrls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    item.equipmentName = equipmentName || item.equipmentName;
    item.category = category || item.category;
    item.description = description || item.description;
    item.pricePerDay = pricePerDay ? Number(pricePerDay) : item.pricePerDay;
    item.location = location || item.location;
    item.availability = availability !== undefined ? availability === 'true' || availability === true : item.availability;
    item.images = imageUrls;

    await item.save();
    res.json(item);
  } catch (error) {
    console.error('Update equipment error:', error);
    res.status(500).json({ message: 'Error updating equipment' });
  }
});

// DELETE Equipment
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Equipment.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    if (item.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to delete this equipment' });
    }

    await Equipment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Delete equipment error:', error);
    res.status(500).json({ message: 'Error deleting equipment' });
  }
});

// POST Add Review (Farmer only)
router.post('/:id/reviews', authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const item = await Equipment.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    const review = new Review({
      userId: req.user._id,
      userName: req.user.name,
      equipmentId: item._id,
      rating: Number(rating),
      comment
    });

    await review.save();

    // Recalculate average rating for equipment
    const allReviews = await Review.find({ equipmentId: item._id });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    item.rating = parseFloat((totalRating / allReviews.length).toFixed(1));
    item.reviewCount = allReviews.length;
    await item.save();

    res.status(201).json(review);
  } catch (error) {
    console.error('Review create error:', error);
    res.status(500).json({ message: 'Error saving review' });
  }
});

export default router;

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';

// Route Imports
import authRoutes from './routes/auth.js';
import equipmentRoutes from './routes/equipment.js';
import bookingRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';

// Model Imports for Seeding
import { User, Equipment, Review } from './models.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve Static Uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Connect to MongoDB & Seed Data
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agrirent';

async function seedData() {
  try {
    // Only seed if no demo users exist to avoid wiping database on container restart
    const existingDemoUser = await User.findOne({ email: 'owner@agrirent.com' });
    if (existingDemoUser) {
      console.log('Initial demo data already exists. Skipping seed.');
      return;
    }

    console.log('Seeding initial agricultural demo data...');

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);

    // Create Users
    const owner = new User({
      name: 'Mallesham Goud',
      email: 'owner@agrirent.com',
      password: defaultPassword,
      role: 'Equipment Owner',
      mobile: '9848022338',
      village: 'Shamshabad',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    });

    const farmer = new User({
      name: 'Ravi Teja',
      email: 'farmer@agrirent.com',
      password: defaultPassword,
      role: 'Farmer',
      mobile: '9848099887',
      village: 'Kondapur',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
    });

    const admin = new User({
      name: 'AgriRent Admin',
      email: 'admin@agrirent.com',
      password: defaultPassword,
      role: 'Admin',
      mobile: '9000100020',
      village: 'Hyderabad',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    });

    await owner.save();
    await farmer.save();
    await admin.save();

    // Create Equipments
    const tractor = new Equipment({
      equipmentName: 'John Deere 5050D Tractor',
      category: 'Tractor',
      description: 'Powerful 50 HP tractor suitable for deep plowing, puddling, and heavy haulage. Comes with clean air filters, dual-clutch transmission, and power steering.',
      pricePerDay: 600,
      location: 'Shamshabad',
      availability: true,
      images: [
        '/uploads/john_deere_tractor.png'
      ],
      ownerId: owner._id,
      rating: 4.8,
      reviewCount: 2
    });

    const harvester = new Equipment({
      equipmentName: 'Kubota Harvester DC-68G',
      category: 'Harvester',
      description: 'High performance combine harvester for paddy and wheat crops. Minimizes grain loss and delivers clean crop output even in wet soil conditions.',
      pricePerDay: 680,
      location: 'Kondapur',
      availability: true,
      images: [
        '/uploads/kubota_harvester.png'
      ],
      ownerId: owner._id,
      rating: 4.5,
      reviewCount: 1
    });

    const rotavator = new Equipment({
      equipmentName: 'Maschio Gaspardo Rotavator',
      category: 'Rotavator',
      description: 'Sturdy rotavator for preparing excellent seedbeds. Easily pulverizes soil clumps and mixes organic residue efficiently.',
      pricePerDay: 550,
      location: 'Shamshabad',
      availability: true,
      images: [
        '/uploads/maschio_rotavator.png'
      ],
      ownerId: owner._id,
      rating: 4.2,
      reviewCount: 1
    });

    const sprayer = new Equipment({
      equipmentName: 'ASPEE Power Sprayer (600L)',
      category: 'Sprayer',
      description: '600 Liters tractor-mounted boom sprayer. Perfect for fast and uniform spraying of insecticides and fertilizers over large cotton or paddy fields.',
      pricePerDay: 350,
      location: 'Shamshabad',
      availability: true,
      images: [
        'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=600'
      ],
      ownerId: owner._id,
      rating: 4.0,
      reviewCount: 0
    });

    await tractor.save();
    await harvester.save();
    await rotavator.save();
    await sprayer.save();

    // Create Reviews
    const rev1 = new Review({
      userId: farmer._id,
      userName: farmer.name,
      equipmentId: tractor._id,
      rating: 5,
      comment: 'Excellent condition! Tractor was very powerful and Mallesham was extremely helpful. Highly recommended!'
    });
    
    const rev2 = new Review({
      userId: farmer._id,
      userName: farmer.name,
      equipmentId: tractor._id,
      rating: 4,
      comment: 'Very efficient tractor. Saved me 3 days of manual labor. Runs smoothly.'
    });

    const rev3 = new Review({
      userId: farmer._id,
      userName: farmer.name,
      equipmentId: harvester._id,
      rating: 5,
      comment: 'Kubota harvester is a beast. Harvested 4 acres of paddy in just 5 hours.'
    });

    await rev1.save();
    await rev2.save();
    await rev3.save();

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Data seeding failed:', err);
  }
}

mongoose.connect(mongoURI)
  .then(async () => {
    console.log('Connected to MongoDB database successfully!');
    await seedData();
  })
  .catch(err => {
    console.error('CRITICAL: MongoDB connection error:', err.message);
    if (!process.env.MONGODB_URI) {
      console.error('PLEASE NOTE: MONGODB_URI is not set in environment variables! Make sure to set MONGODB_URI on Render dashboard.');
    }
  });

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Serve Built Frontend (Production Single-Link Deployment)
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  console.warn('⚠️ WARNING: frontend/dist folder not found! Make sure "npm run build" runs during Render deployment.');
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>AgriRent Server</title></head>
        <body style="font-family: system-ui, sans-serif; padding: 40px; line-height: 1.6; max-width: 600px; margin: auto;">
          <h2>🌱 AgriRent API is running...</h2>
          <p style="color: #666;">The static frontend build was not found in <code>frontend/dist</code>.</p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 12px; margin-top: 20px;">
            <h3 style="margin-top: 0; color: #166534;">How to load the website UI on Render:</h3>
            <ol style="margin-bottom: 0; padding-left: 20px; color: #15803d;">
              <li>Go to <strong>Render Dashboard &rarr; Your Service &rarr; Settings</strong>.</li>
              <li>Set <strong>Build Command</strong> to: <code>npm run build</code></li>
              <li>Set <strong>Start Command</strong> to: <code>npm run start</code></li>
              <li>Click <strong>Manual Deploy &rarr; Clear Build Cache & Deploy</strong>.</li>
            </ol>
          </div>
        </body>
      </html>
    `);
  });
}

app.listen(PORT, () => {
  console.log(`Server launched successfully on port ${PORT}`);
});


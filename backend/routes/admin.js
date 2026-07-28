import express from 'express';
import { User, Equipment, Booking, Review } from '../models.js';
import { authMiddleware, adminMiddleware } from './authMiddleware.js';

const router = express.Router();

// Apply adminMiddleware to all routes here
router.use(authMiddleware);
router.use(adminMiddleware);

// GET General Platform Metrics & Reports
router.get('/metrics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const farmersCount = await User.countDocuments({ role: 'Farmer' });
    const ownersCount = await User.countDocuments({ role: 'Equipment Owner' });
    
    const totalEquipment = await Equipment.countDocuments();
    const activeRentals = await Booking.countDocuments({ bookingStatus: 'Approved' });
    const completedRentals = await Booking.countDocuments({ bookingStatus: 'Completed' });

    const bookings = await Booking.find({ paymentStatus: 'Paid' });
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

    // Dummy complaints for Admin
    const complaints = [
      { id: 1, from: 'Ramesh Kumar', equipment: 'John Deere 5050D', issue: 'Equipment delivered 2 hours late.', date: '2026-05-27', status: 'Pending' },
      { id: 2, from: 'Suresh Rao', equipment: 'Mahindra Arjun 555', issue: 'Sprayer nozzle was slightly clogged.', date: '2026-05-25', status: 'Resolved' }
    ];

    res.json({
      metrics: {
        totalUsers,
        farmersCount,
        ownersCount,
        totalEquipment,
        activeRentals,
        completedRentals,
        totalRevenue
      },
      complaints
    });
  } catch (error) {
    console.error('Fetch admin metrics error:', error);
    res.status(500).json({ message: 'Error retrieving admin metrics' });
  }
});

// GET All Users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Fetch users list error:', error);
    res.status(500).json({ message: 'Error retrieving users list' });
  }
});

// DELETE User
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete their listings and bookings too for clean cascade
    await Equipment.deleteMany({ ownerId: user._id });
    await Booking.deleteMany({ $or: [{ farmerId: user._id }, { ownerId: user._id }] });
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

export default router;

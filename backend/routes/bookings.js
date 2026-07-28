import express from 'express';
import { Booking, Equipment, User } from '../models.js';
import { authMiddleware } from './authMiddleware.js';

const router = express.Router();

// Create new booking
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { equipmentId, bookingDate, returnDate } = req.body;
    
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    if (!equipment.availability) {
      return res.status(400).json({ message: 'Equipment is currently not available' });
    }

    // Calculate total price
    const start = new Date(bookingDate);
    const end = new Date(returnDate);
    const timeDiff = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) || 1;
    const totalPrice = days * equipment.pricePerDay;

    const booking = new Booking({
      farmerId: req.user._id,
      equipmentId: equipment._id,
      bookingDate: start,
      returnDate: end,
      totalPrice,
      paymentStatus: 'Pending',
      bookingStatus: 'Pending'
    });

    await booking.save();

    // Mark equipment as unavailable if appropriate, or keep it manageable
    // For demonstration, let's keep it available so multiple bookings can be simulated easily, or update availability.
    // Let's set availability to false upon successful booking approval instead of request.

    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Error creating booking' });
  }
});

// GET Farmer Booking History
router.get('/farmer', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ farmerId: req.user._id })
      .populate({
        path: 'equipmentId',
        populate: { path: 'ownerId', select: 'name mobile village' }
      })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Fetch farmer bookings error:', error);
    res.status(500).json({ message: 'Error retrieving bookings' });
  }
});

// GET Owner Received Bookings & Analytics
router.get('/owner', authMiddleware, async (req, res) => {
  try {
    // Find all equipments owned by this user
    const ownerEquipments = await Equipment.find({ ownerId: req.user._id });
    const equipmentIds = ownerEquipments.map(item => item._id);

    // Find all bookings for these equipments
    const bookings = await Booking.find({ equipmentId: { $in: equipmentIds } })
      .populate('farmerId', 'name mobile village')
      .populate('equipmentId', 'equipmentName pricePerDay category')
      .sort({ createdAt: -1 });

    // Analytics calculations
    const totalEarnings = bookings
      .filter(b => b.paymentStatus === 'Paid')
      .reduce((sum, b) => sum + b.totalPrice, 0);

    const pendingRequests = bookings.filter(b => b.bookingStatus === 'Pending').length;
    const activeRentals = bookings.filter(b => b.bookingStatus === 'Approved').length;

    // Monthly aggregation for Chart.js
    const monthlyEarnings = Array(6).fill(0);
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(d.toLocaleString('default', { month: 'short' }));
    }

    // Populate simulated or real monthly earnings
    bookings.forEach(b => {
      if (b.paymentStatus === 'Paid') {
        const bMonth = new Date(b.bookingDate).toLocaleString('default', { month: 'short' });
        const idx = months.indexOf(bMonth);
        if (idx !== -1) {
          monthlyEarnings[idx] += b.totalPrice;
        }
      }
    });

    res.json({
      bookings,
      analytics: {
        totalEarnings,
        pendingRequests,
        activeRentals,
        totalBookings: bookings.length,
        chartData: {
          labels: months,
          datasets: [
            {
              label: 'Earnings (₹)',
              data: monthlyEarnings,
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.2)'
            }
          ]
        }
      }
    });
  } catch (error) {
    console.error('Fetch owner bookings error:', error);
    res.status(500).json({ message: 'Error retrieving owner bookings' });
  }
});

// PUT Update Booking Status (Approve/Reject/Cancel)
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body; // Approved, Rejected, Completed, Cancelled
    const booking = await Booking.findById(req.id || req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.bookingStatus = status;

    if (status === 'Approved') {
      // Toggle equipment availability
      await Equipment.findByIdAndUpdate(booking.equipmentId, { availability: false });
    } else if (status === 'Completed' || status === 'Rejected' || status === 'Cancelled') {
      await Equipment.findByIdAndUpdate(booking.equipmentId, { availability: true });
    }

    await booking.save();
    res.json(booking);
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Error updating booking status' });
  }
});

// PUT Update Payment Status (Confirm Payment)
router.put('/:id/payment', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body; // Paid, Failed
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.paymentStatus = status;
    if (status === 'Paid') {
      booking.bookingStatus = 'Approved';
      await Equipment.findByIdAndUpdate(booking.equipmentId, { availability: false });
    }
    
    await booking.save();
    res.json(booking);
  } catch (error) {
    console.error('Update booking payment error:', error);
    res.status(500).json({ message: 'Error updating payment status' });
  }
});

export default router;

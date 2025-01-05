import express from "express";
import Booking from "../models/booking.model.js";
import Listing from "../models/listing.model.js";

const router = express.Router();

// Add a booking
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, bookingDate, listingId } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (!name || !email || !phone || !bookingDate) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newBooking = new Booking({
      name,
      email,
      phone,
      bookingDate: new Date(bookingDate),
      userId: listing.userRef,
      listingId,
    });

    await newBooking.save();
    res
      .status(201)
      .json({ message: "Booking created successfully", booking: newBooking });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Delete a booking
router.delete("/bookings/:id", async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await booking.deleteOne();

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting booking", error });
  }
});

// Update booking status (Cancel or Reject)
router.put("/bookings/:id", async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;

    if (!["Cancelled", "Rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: 'Invalid status. Use "Cancelled" or "Rejected".' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking ${status.toLowerCase()} successfully`,
      data: booking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating booking status", error });
  }
});

// Fetch bookings for admin (who posted the listing)
router.get("/admin/:adminId", async (req, res) => {
  try {
    const adminId = req.params.adminId;

    // Find all listings posted by the admin
    const listings = await Listing.find({ userRef: adminId }).select("_id");

    if (!listings.length) {
      return res
        .status(400)
        .json({ message: "No listings found for this admin" });
    }

    const listingIds = listings.map((listing) => listing._id);

    // Fetch bookings for those listings
    const bookings = await Booking.find({ listingId: { $in: listingIds } })
      .populate("listingId", "name address")
      .populate("userId", "username email");

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching bookings for admin", error });
  }
});

export default router;

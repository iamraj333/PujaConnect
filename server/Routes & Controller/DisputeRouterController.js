
const express = require("express");
const DisputeRouter = express.Router();
const TokenAuthMiddleware = require("../Middleware/TokenAuthMiddleware");
const Dispute = require("../Models/Dispute");
const Booking = require("../Models/Booking");
const Pandit = require("../Models/Pandit");

// Raise a dispute
DisputeRouter.post("/create", TokenAuthMiddleware, async (req, res) => {
    try {
        if (!["user", "pandit"].includes(req.role)) {
            return res.status(403).json({ error: "Only customers and Pandits can raise disputes." });
        }

        const { booking, subject, description } = req.body;

        if (!booking || !subject?.trim() || !description?.trim()) {
            return res.status(400).json({ error: "Please provide booking, subject and description." });
        }

        const selectedBooking = await Booking.findById(booking);

        if (!selectedBooking) {
            return res.status(404).json({ error: "Booking not found." });
        }

        if (!["confirmed", "completed"].includes(selectedBooking.status)) {
            return res.status(400).json({ error: "Disputes can only be raised for confirmed or completed bookings." });
        }

        const currentUserId = req.user.id || req.user._id;
        let panditId;

        if (req.role === "user") {
            if (selectedBooking.user.toString() !== currentUserId.toString()) {
                return res.status(403).json({ error: "You can only raise disputes for your own bookings." });
            }

            panditId = selectedBooking.selectedPandit;
        } else {
            if (!selectedBooking.selectedPandit || selectedBooking.selectedPandit.toString() !== currentUserId.toString()) {
                return res.status(403).json({ error: "You can only raise disputes for bookings assigned to you." });
            }

            panditId = currentUserId;
        }

        if (!panditId) {
            return res.status(400).json({ error: "This booking does not have an assigned Pandit." });
        }

        const existingDispute = await Dispute.findOne({
            booking: selectedBooking._id,
            raisedBy: req.role
        });

        if (existingDispute) {
            return res.status(409).json({ error: "You have already raised a dispute for this booking." });
        }

        const dispute = await Dispute.create({
            booking: selectedBooking._id,
            raisedBy: req.role,
            user: selectedBooking.user,
            pandit: panditId,
            subject: subject.trim(),
            description: description.trim()
        });

        return res.status(201).json({
            success: true,
            message: "Dispute submitted successfully.",
            dispute
        });
    } catch (error) {
        console.error("Create dispute error:", error);
        return res.status(500).json({ error: "Failed to submit dispute." });
    }
});

// Get disputes raised by the logged-in customer or Pandit
DisputeRouter.get("/my", TokenAuthMiddleware, async (req, res) => {
    try {
        if (!["user", "pandit"].includes(req.role)) {
            return res.status(403).json({ error: "Access denied." });
        }

        const filter = req.role === "user"
            ? { user: req.user.id || req.user._id, raisedBy: "user" }
            : { pandit: req.user.id || req.user._id, raisedBy: "pandit" };

        const disputes = await Dispute.find(filter)
            .populate("booking", "bookingDate startTime status")
            .populate("user", "name")
            .populate("pandit", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, disputes });
    } catch (error) {
        console.error("Fetch my disputes error:", error);
        return res.status(500).json({ error: "Failed to fetch your disputes." });
    }
});

module.exports = DisputeRouter;

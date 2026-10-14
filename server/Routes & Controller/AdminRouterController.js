
const express = require("express");
const TokenAuthMiddleware = require("../Middleware/TokenAuthMiddleware");
const Ritual = require("../Models/Ritual");
const Pandit = require("../Models/Pandit");
const Booking = require("../Models/Booking");
const User = require("../models/User");
const Dispute = require("../Models/Dispute");
const Feedback = require("../Models/Feedback");


const AdminRouter = express.Router();

AdminRouter.get("/dashboard", TokenAuthMiddleware, async (req, res) => {
    if (req.role !== "admin") {
        return res.status(403).json({ error: "Access denied." });
    }

    try {
        const [totalRituals, pendingVerifications, totalBookings, totalUsers] = await Promise.all([
            Ritual.countDocuments(),
            Pandit.countDocuments({ verificationStatus: "pending" }),
            Booking.countDocuments(),
            User.countDocuments()
        ]);

        return res.status(200).json({
            success: "Admin dashboard loaded successfully.",
            stats: {
                totalRituals,
                pendingVerifications,
                totalBookings,
                totalUsers
            }
        });
    } catch (error) {
        console.error("Admin dashboard error:", error);
        return res.status(500).json({ error: "Failed to load dashboard data." });
    }
});


AdminRouter.get("/pandits", TokenAuthMiddleware, async (req, res) => {
    if (req.role !== "admin") return res.status(403).json({ error: "Access denied." });
    try {
        const pandits = await Pandit.find()
            .select("-password")
            .sort({ createdAt: -1 });
        return res.status(200).json({ success: "Pandits fetched successfully.", pandits });
    } catch (error) {
        console.error("Fetch pandits error:", error);
        return res.status(500).json({ error: "Failed to fetch pandits." });
    }
});

AdminRouter.patch("/pandits/:id/verification", TokenAuthMiddleware, async (req, res) => {
    if (req.role !== "admin") return res.status(403).json({ error: "Access denied." });
    try {
        const { verificationStatus } = req.body;
        if (!["approved", "rejected"].includes(verificationStatus)) {
            return res.status(400).json({ error: "Invalid verification status." });
        }
        const pandit = await Pandit.findByIdAndUpdate(
            req.params.id,
            { verificationStatus },
            { new: true, runValidators: true }
        ).select("-password");
        if (!pandit) return res.status(404).json({ error: "Pandit not found." });
        return res.status(200).json({
            success: `Pandit ${verificationStatus} successfully.`,
            pandit
        });
    } catch (error) {
        console.error("Update pandit verification error:", error);
        if (error.name === "CastError") return res.status(400).json({ error: "Invalid pandit ID." });
        return res.status(500).json({ error: "Failed to update verification status." });
    }
});


AdminRouter.get("/bookings", TokenAuthMiddleware, async (req, res) => {
    if (req.role !== "admin") {
        return res.status(403).json({ error: "Access denied." });
    }
    try {
        const bookings = await Booking.find()
            .populate("user", "name phone")
            .populate("ritual", "name")
            .populate("selectedPandit", "name phone")
            .sort({ createdAt: -1 });

        const bookingIds = bookings.map(booking => booking._id);
        const feedbacks = await Feedback.find({ booking: { $in: bookingIds } })
            .select("booking rating comment review")
            .lean();

        const feedbackMap = new Map(
            feedbacks.map(feedback => [String(feedback.booking), feedback])
        );

        const bookingsWithFeedback = bookings.map(booking => {
            const item = booking.toObject();
            const feedback = feedbackMap.get(String(booking._id));

            item.feedback = feedback ? {
                rating: feedback.rating,
                comment: feedback.comment || feedback.review || ""
            } : null;

            return item;
        });

        return res.status(200).json({
            success: "Bookings fetched successfully.",
            bookings: bookingsWithFeedback
        });
    } catch (error) {
        console.error("Fetch bookings error:", error);
        return res.status(500).json({ error: "Failed to fetch bookings." });
    }
});

AdminRouter.get("/users", TokenAuthMiddleware, async (req, res) => {
    if (req.role !== "admin") {
        return res.status(403).json({ error: "Access denied." });
    }
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });
        return res.status(200).json({
            success: "Users fetched successfully.",
            users
        });
    } catch (error) {
        console.error("Fetch users error:", error);
        return res.status(500).json({ error: "Failed to fetch users." });
    }
});

// Get all disputes
AdminRouter.get("/disputes", TokenAuthMiddleware, async (req, res) => {
    try {
        if (req.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admin only." });
        }

        const disputes = await Dispute.find()
            .populate("booking", "bookingDate startTime status price")
            .populate("user", "name email phone")
            .populate("pandit", "name email phone")
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, disputes });
    } catch (error) {
        console.error("Fetch disputes error:", error);
        return res.status(500).json({ error: "Failed to fetch disputes." });
    }
});

// Update dispute status and resolution
AdminRouter.patch("/disputes/:id", TokenAuthMiddleware, async (req, res) => {
    try {
        if (req.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admin only." });
        }

        const { status, resolution } = req.body;
        const allowedStatuses = ["under_review", "resolved", "rejected"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid dispute status." });
        }

        if (["resolved", "rejected"].includes(status) && !String(resolution || "").trim()) {
            return res.status(400).json({ error: "Please provide a resolution before closing the dispute." });
        }

        const dispute = await Dispute.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    status,
                    resolution: String(resolution || "").trim()
                }
            },
            { new: true, runValidators: true }
        )
            .populate("booking", "bookingDate startTime status price")
            .populate("user", "name email phone")
            .populate("pandit", "name email phone");

        if (!dispute) {
            return res.status(404).json({ error: "Dispute not found." });
        }

        return res.status(200).json({
            success: true,
            message: "Dispute updated successfully.",
            dispute
        });
    } catch (error) {
        console.error("Update dispute error:", error);
        return res.status(500).json({ error: "Failed to update dispute." });
    }
});

module.exports = AdminRouter;

const express = require("express");
const FeedbackRouter = express.Router();
const TokenAuthMiddleware = require("../Middleware/TokenAuthMiddleware");
const Booking = require("../Models/Booking");
const Feedback = require("../Models/Feedback");
const Pandit = require("../Models/Pandit");

// Submit feedback
FeedbackRouter.post("/create", TokenAuthMiddleware, async (req, res) => {
    try {
        if (req.role !== "user") {
            return res.status(403).json({ error: "Only customers can submit feedback." });
        }

        const { bookingId, rating, comment } = req.body;

        if (!bookingId || !rating) {
            return res.status(400).json({ error: "Booking and rating are required." });
        }

        if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5." });
        }

        const currentUserId = req.user.id || req.user._id;
        const booking = await Booking.findOne({
            _id: bookingId,
            user: currentUserId,
            status: "completed"
        });

        if (!booking) {
            return res.status(404).json({ error: "Completed booking not found." });
        }

        if (!booking.selectedPandit) {
            return res.status(400).json({ error: "No Pandit is assigned to this booking." });
        }

        const existingFeedback = await Feedback.findOne({ booking: booking._id });

        if (existingFeedback) {
            return res.status(400).json({ error: "Feedback has already been submitted for this booking." });
        }

        const pandit = await Pandit.findById(booking.selectedPandit);

        if (!pandit) {
            return res.status(404).json({ error: "Pandit not found." });
        }

        const feedback = await Feedback.create({
            user: currentUserId,
            pandit: pandit._id,
            booking: booking._id,
            rating: Number(rating),
            comment: comment?.trim() || ""
        });

        return res.status(201).json({
            success: true,
            message: "Feedback submitted successfully.",
            feedback
        });
    } catch (error) {
        console.error("Create feedback error:", error);
        return res.status(500).json({ error: "Failed to submit feedback." });
    }
});


// Customer: apne submitted feedback dekhe
FeedbackRouter.get("/my", TokenAuthMiddleware, async (req, res) => {
    try {
        if (req.role !== "user") {
            return res.status(403).json({ error: "Only customers can view their feedback." });
        }
        const feedback = await Feedback.find({ user: req.user.id })
            .populate("pandit", "name profileImage")
            .populate({
                path: "booking",
                select: "ritual bookingDate",
                populate: { path: "ritual", select: "name" }
            })
            .sort({ createdAt: -1 });
        return res.status(200).json({ feedback });
    } catch (error) {
        console.error("Fetch customer feedback error:", error);
        return res.status(500).json({ error: "Failed to fetch feedback." });
    }
});

// Pandit: apne received reviews dekhe
FeedbackRouter.get("/pandit/my", TokenAuthMiddleware, async (req, res) => {
    if (req.role !== "pandit") {
        return res.status(403).json({ error: "Access denied." });
    }
    try {
        const feedback = await Feedback.find({ pandit: req.user.id })
            .populate("user", "name")
            .populate({
                path: "booking",
                select: "ritual bookingDate status",
                populate: {
                    path: "ritual",
                    select: "name"
                }
            })
            .sort({ createdAt: -1 })
            .lean();

        const ratings = feedback
            .map(item => item.rating)
            .filter(rating => typeof rating === "number" && rating >= 1 && rating <= 5);

        const averageRating = ratings.length
            ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
            : 0;

        return res.status(200).json({
            success: true,
            feedback,
            totalReviews: feedback.length,
            averageRating: Number(averageRating.toFixed(1))
        });
    } catch (error) {
        console.error("Fetch Pandit feedback error:", error);
        return res.status(500).json({ error: "Failed to load reviews." });
    }
});

// Public: kisi bhi Pandit ke reviews dekhe
FeedbackRouter.get("/pandit/:panditId", async (req, res) => {
    try {
        const pandit = await Pandit.findById(req.params.panditId)
            .select("name profileImage");
        if (!pandit) {
            return res.status(404).json({ error: "Pandit not found." });
        }
        const feedback = await Feedback.find({ pandit: pandit._id })
            .populate("user", "name")
            .populate({
                path: "booking",
                select: "ritual bookingDate",
                populate: { path: "ritual", select: "name" }
            })
            .sort({ createdAt: -1 });
        const totalReviews = feedback.length;
        const averageRating = totalReviews
            ? feedback.reduce((sum, item) => sum + item.rating, 0) / totalReviews
            : 0;
        return res.status(200).json({
            pandit,
            feedback,
            totalReviews,
            averageRating: Number(averageRating.toFixed(1))
        });
    } catch (error) {
        console.error("Fetch public reviews error:", error);
        return res.status(500).json({ error: "Failed to fetch reviews." });
    }
});

module.exports = FeedbackRouter;
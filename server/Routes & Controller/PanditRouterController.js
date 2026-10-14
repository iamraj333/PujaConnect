const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Pandit = require("../Models/Pandit");
const TokenAuthMiddleware = require("../Middleware/TokenAuthMiddleware");
const Ritual = require("../Models/Ritual");
const Feedback = require("../Models/Feedback");
const PanditRouter = express.Router();

PanditRouter.post("/register", async (req, res) => {
    try {
        const { name, email, phone, password, bio, experience, languages, idProof, location } = req.body;

        if (!name || !email || !phone || !password || experience === undefined || !idProof || !location?.city || !location?.state || !location?.pincode) {
            return res.status(400).json({ error: "Please fill in all required fields." });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters long." });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingPandit = await Pandit.findOne({ email: normalizedEmail });

        if (existingPandit) {
            return res.json({ error: "Email is already registered." });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const pandit = await Pandit.create({
            name: name.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            password: hashedPassword,
            bio: bio?.trim() || "",
            experience: Number(experience),
            languages: Array.isArray(languages) ? languages : [],
            idProof: idProof.trim(),
            location: {
                city: location.city.trim(),
                state: location.state.trim(),
                pincode: location.pincode.trim()
            },
            verificationStatus: "pending"
        });

        const token = jwt.sign(
            { id: pandit._id, email: pandit.email, role: "pandit" },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1d" }
        );

        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(201).json({
            success: "Pandit registration successful. Your profile is pending verification.",
            pandit: {
                id: pandit._id,
                name: pandit.name,
                email: pandit.email,
                verificationStatus: pandit.verificationStatus
            }
        });
    } catch (error) {
        console.error("Pandit registration error:", error);
        return res.status(500).json({ error: "Something went wrong. Please try again." });
    }
});

PanditRouter.get("/profile", TokenAuthMiddleware, async (req, res) => {
    try {
        if (req.role !== "pandit") {
            return res.status(403).json({ error: "Only Pandits can access this profile." });
        }

        const pandit = await Pandit.findById(req.user.id || req.user._id).select("-password");

        if (!pandit) {
            return res.status(404).json({ error: "Pandit not found." });
        }

        return res.status(200).json({ success: true, pandit });
    } catch (error) {
        console.error("Fetch Pandit profile error:", error);
        return res.status(500).json({ error: "Failed to fetch Pandit profile." });
    }
});

PanditRouter.patch("/availability", TokenAuthMiddleware, async (req, res) => {
    try {
        if (req.role !== "pandit") {
            return res.status(403).json({ error: "Only Pandits can update availability." });
        }

        const { availability } = req.body;

        if (typeof availability !== "boolean") {
            return res.status(400).json({ error: "Availability must be true or false." });
        }

        const pandit = await Pandit.findById(req.user.id || req.user._id);

        if (!pandit) {
            return res.status(404).json({ error: "Pandit not found." });
        }

        if (pandit.verificationStatus !== "approved" || !pandit.isActive) {
            return res.status(403).json({
                error: "Only approved and active Pandits can change availability."
            });
        }

        pandit.availability = availability;
        await pandit.save();

        return res.status(200).json({
            success: true,
            message: `You are now ${availability ? "available" : "unavailable"} for bookings.`,
            pandit: {
                _id: pandit._id,
                name: pandit.name,
                verificationStatus: pandit.verificationStatus,
                availability: pandit.availability,
                isActive: pandit.isActive
            }
        });
    } catch (error) {
        console.error("Update Pandit availability error:", error);
        return res.status(500).json({ error: "Failed to update availability." });
    }
});


PanditRouter.patch("/rituals", TokenAuthMiddleware, async (req, res) => {
    try {
        if (req.role !== "pandit") {
            return res.status(403).json({ error: "Only Pandits can update their rituals." });
        }

        const { rituals } = req.body;

        if (!Array.isArray(rituals)) {
            return res.status(400).json({ error: "Please provide a valid rituals array." });
        }

        const pandit = await Pandit.findById(req.user.id || req.user._id);

        if (!pandit) {
            return res.status(404).json({ error: "Pandit not found." });
        }

        const validRituals = await Ritual.find({
            _id: { $in: rituals },
            isActive: true
        }).select("_id");

        if (validRituals.length !== new Set(rituals.map(String)).size) {
            return res.status(400).json({ error: "One or more selected rituals are invalid or inactive." });
        }

        pandit.rituals = validRituals.map(ritual => ritual._id);
        await pandit.save();

        return res.status(200).json({
            success: true,
            message: "Your rituals have been updated successfully.",
            rituals: pandit.rituals
        });
    } catch (error) {
        console.error("Update Pandit rituals error:", error);
        return res.status(500).json({ error: "Failed to update your rituals." });
    }
});

PanditRouter.get("/all", async (req, res) => {
    try {
        const pandits = await Pandit.find({
            verificationStatus: "approved",
            isActive: true
        })
        .select("-password -idProof")
        .populate("rituals", "name");

        const feedback = await Feedback.aggregate([
            {
                $group: {
                    _id: "$pandit",
                    totalReviews: { $sum: 1 },
                    averageRating: { $avg: "$rating" }
                }
            }
        ]);

        const result = pandits.map(pandit => {
            const review = feedback.find(
                item => item._id.toString() === pandit._id.toString()
            );

            return {
                ...pandit.toObject(),
                rating: review ? Number(review.averageRating.toFixed(1)) : 0,
                reviews: review ? review.totalReviews : 0
            };
        });

        return res.status(200).json({ pandits: result });
    } catch (error) {
        console.error("Fetch Pandits error:", error);
        return res.status(500).json({ error: "Failed to fetch Pandits." });
    }
});

module.exports = PanditRouter;
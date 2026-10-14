const express = require("express");
const BookingRouter = express.Router();
const TokenAuthMiddleware = require("../Middleware/TokenAuthMiddleware");
const Ritual = require("../Models/Ritual");
const Booking = require("../Models/Booking");
const Pandit = require("../Models/Pandit");

BookingRouter.post("/create", TokenAuthMiddleware, async (req, res) => {
    try {
        if (req.role !== "user") {
            return res.status(403).json({ error: "Only customers can book a puja." });
        }

        const { ritual, bookingDate, startTime, locationType, address, price, notes } = req.body;

        if (!ritual || !bookingDate || !startTime || !locationType || price === undefined || price === "") {
            return res.status(400).json({ error: "Please provide all required booking details." });
        }

        if (!["home", "temple"].includes(locationType)) {
            return res.status(400).json({ error: "Invalid location type." });
        }

        const selectedRitual = await Ritual.findOne({ _id: ritual, isActive: true });
        if (!selectedRitual) {
            return res.status(404).json({ error: "Puja not found or unavailable." });
        }

        if (!selectedRitual.locationType.includes(locationType)) {
            return res.status(400).json({ error: "This puja is not available at the selected location type." });
        }

        if (!Number.isFinite(Number(price)) || Number(price) < selectedRitual.priceRange.min || Number(price) > selectedRitual.priceRange.max) {
            return res.status(400).json({ error: "Price must be within the puja's specified price range." });
        }

        const date = new Date(bookingDate);
        if (Number.isNaN(date.getTime()) || date < new Date(new Date().setHours(0, 0, 0, 0))) {
            return res.status(400).json({ error: "Please select a valid current or future booking date." });
        }

        const requiredAddressFields = ["house", "street", "area", "city", "state", "pincode"];
        if (!address || requiredAddressFields.some(field => !String(address[field] || "").trim())) {
            return res.status(400).json({ error: "Please provide the complete ceremony address." });
        }


        const eligiblePandits = await Pandit.find({
            verificationStatus: "approved",
            isActive: true,
            availability: true,
            rituals: selectedRitual._id,
            "location.city": { $regex: `^${address.city.trim()}$`, $options: "i" },
            "location.state": { $regex: `^${address.state.trim()}$`, $options: "i" }
        }).select("_id");

        if (eligiblePandits.length === 0) {
            return res.status(400).json({
                error: "No available Pandit is registered for this puja in your city."
            });
        }

        const booking = await Booking.create({
            user: req.user.id || req.user._id,
            ritual,
            pandits: eligiblePandits.map(pandit => pandit._id),
            bookingDate: date,
            startTime,
            locationType,
            address,
            price: Number(price),
            notes: notes || ""
        });

        return res.status(201).json({
            success: true,
            message: "Puja booking created successfully.",
            booking
        });
    } catch (error) {
        console.error("Create booking error:", error);
        return res.status(500).json({ error: "Failed to create puja booking." });
    }
});


BookingRouter.get("/my", TokenAuthMiddleware, async (req, res) => {
    try {
        if (req.role !== "user") {
            return res.status(403).json({ error: "Only customers can view their bookings." });
        }

        const bookings = await Booking.find({
            user: req.user.id || req.user._id
        })
            .populate("ritual", "name description duration")
            .populate("selectedPandit", "name phone")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            bookings
        });
    } catch (error) {
        console.error("Fetch user bookings error:", error);
        return res.status(500).json({ error: "Failed to fetch your bookings." });
    }
});

BookingRouter.patch("/cancel/:id", TokenAuthMiddleware, async (req, res) => {
    try {
        if (req.role !== "user") {
            return res.status(403).json({ error: "Only customers can cancel bookings." });
        }

        const booking = await Booking.findOne({
            _id: req.params.id,
            user: req.user.id || req.user._id
        });

        if (!booking) {
            return res.status(404).json({ error: "Booking not found." });
        }

        if (!["pending", "confirmed"].includes(booking.status)) {
            return res.status(400).json({
                error: "This booking cannot be cancelled."
            });
        }

        booking.status = "cancelled";
        await booking.save();

        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully.",
            booking
        });
    } catch (error) {
        console.error("Cancel booking error:", error);
        return res.status(500).json({
            error: "Failed to cancel booking."
        });
    }
});


BookingRouter.get("/pandit", TokenAuthMiddleware, async (req, res) => {
    try {
        if (req.role !== "pandit") {
            return res.status(403).json({ error: "Only Pandits can view these bookings." });
        }

        const pandit = await Pandit.findById(req.user.id || req.user._id);

        if (!pandit) {
            return res.status(404).json({ error: "Pandit not found." });
        }

        const bookings = await Booking.find({
            $or: [
                { pandits: pandit._id },
                { selectedPandit: pandit._id }
            ]
        })
            .populate("ritual", "name description duration")
            .populate("user", "name phone address")
            .sort({ bookingDate: 1, startTime: 1 });

        return res.status(200).json({ success: true, bookings });
    } catch (error) {
        console.error("Fetch Pandit bookings error:", error);
        return res.status(500).json({ error: "Failed to fetch bookings." });
    }
});




BookingRouter.patch("/pandit/:id/respond", TokenAuthMiddleware, async (req, res) => {
    try {
        if (req.role !== "pandit") {
            return res.status(403).json({ error: "Only Pandits can respond to bookings." });
        }

        const { action } = req.body;
        if (!["accept", "reject"].includes(action)) {
            return res.status(400).json({ error: "Invalid booking action." });
        }

        const pandit = await Pandit.findOne({
            _id: req.user.id || req.user._id,
            verificationStatus: "approved",
            isActive: true
        });

        if (!pandit) {
            return res.status(403).json({ error: "Your Pandit account is not approved or active." });
        }

        if (action === "accept") {
            if (!pandit.availability) {
                return res.status(400).json({ error: "You are currently unavailable for bookings." });
            }

            const requestedBooking = await Booking.findOne({
                _id: req.params.id,
                pandits: pandit._id,
                selectedPandit: null,
                status: "pending"
            }).populate("ritual", "duration");

            if (!requestedBooking) {
                return res.status(409).json({ error: "Booking is no longer available or was already accepted." });
            }

            const bookingDate = new Date(requestedBooking.bookingDate);
            const dayStart = new Date(bookingDate);
            dayStart.setUTCHours(0, 0, 0, 0);
            const dayEnd = new Date(dayStart);
            dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

            const existingBookings = await Booking.find({
                selectedPandit: pandit._id,
                status: "confirmed",
                bookingDate: { $gte: dayStart, $lt: dayEnd },
                _id: { $ne: requestedBooking._id }
            }).populate("ritual", "duration");

            const [hours, minutes] = requestedBooking.startTime.split(":").map(Number);
            const requestedStart = hours * 60 + minutes;
            const requestedEnd = requestedStart + (requestedBooking.ritual?.duration || 0);

            for (const existing of existingBookings) {
                const [existingHours, existingMinutes] = existing.startTime.split(":").map(Number);
                const existingStart = existingHours * 60 + existingMinutes;
                const existingEnd = existingStart + (existing.ritual?.duration || 0);

                if (requestedStart < existingEnd && requestedEnd > existingStart) {
                    return res.status(409).json({
                        error: "You already have another confirmed booking during this time."
                    });
                }
            }

            const booking = await Booking.findOneAndUpdate(
                {
                    _id: requestedBooking._id,
                    pandits: pandit._id,
                    selectedPandit: null,
                    status: "pending"
                },
                {
                    $set: {
                        selectedPandit: pandit._id,
                        status: "confirmed",
                        pandits: [pandit._id]
                    }
                },
                { new: true, runValidators: true }
            ).populate("ritual", "name duration");

            if (!booking) {
                return res.status(409).json({ error: "Booking is no longer available or was already accepted." });
            }

            return res.status(200).json({
                success: true,
                message: "Booking accepted successfully.",
                booking
            });
        }

        const booking = await Booking.findOneAndUpdate(
            {
                _id: req.params.id,
                pandits: pandit._id,
                selectedPandit: null,
                status: "pending"
            },
            {
                $pull: { pandits: pandit._id }
            },
            { new: true, runValidators: true }
        );

        if (!booking) {
            return res.status(409).json({ error: "Booking is no longer available." });
        }

        if (booking.pandits.length === 0 && !booking.selectedPandit) {
            booking.status = "rejected";
            await booking.save();
        }

        return res.status(200).json({
            success: true,
            message: "Booking request rejected.",
            booking
        });
    } catch (error) {
        console.error("Pandit booking response error:", error);
        return res.status(500).json({ error: "Failed to respond to booking." });
    }
});




BookingRouter.patch("/pandit/:id/complete", TokenAuthMiddleware, async (req, res) => {
    try {
        if (req.role !== "pandit") {
            return res.status(403).json({ error: "Only Pandits can complete bookings." });
        }

        const pandit = await Pandit.findOne({
            _id: req.user.id || req.user._id,
            verificationStatus: "approved",
            isActive: true
        });

        if (!pandit) {
            return res.status(403).json({ error: "Your Pandit account is not approved or active." });
        }

        const booking = await Booking.findOneAndUpdate(
            {
                _id: req.params.id,
                selectedPandit: pandit._id,
                status: "confirmed"
            },
            {
                $set: { status: "completed" }
            },
            { new: true }
        ).populate("ritual", "name");

        if (!booking) {
            return res.status(400).json({
                error: "Only your confirmed bookings can be marked as completed."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Booking marked as completed.",
            booking
        });
    } catch (error) {
        console.error("Complete booking error:", error);
        return res.status(500).json({ error: "Failed to complete booking." });
    }
});


module.exports = BookingRouter;
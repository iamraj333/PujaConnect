const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const TokenAuthMiddleware = require("../Middleware/TokenAuthMiddleware");
const Booking = require("../Models/Booking");
const UserRouter = express.Router();

UserRouter.post("/register", async (req, res) => {
    try {
        const { name, email, phone, password, address } = req.body;
        if (!name || !email || !phone || !password || !address) {
            return res.status(400).json({ error: "All fields are required." });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters." });
        }
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.json({ error: "Email is already registered." });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            password: hashedPassword,
            address: address
        });
        const token = jwt.sign({ id: user._id, email: user.email, role: "user" }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
            maxAge: 1 * 24 * 60 * 60 * 1000 //1day
        });
        return res.status(201).json({
            success: "Account created successfully.",
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error("Registration error:", error.message);
        return res.status(500).json({ error: "Something went wrong. Please try again." });
    }
});



UserRouter.get("/dashboard", TokenAuthMiddleware, async (req, res) => {
    if (req.role !== "user") {
        return res.status(403).json({ error: "Access denied." });
    }
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const bookings = await Booking.find({ user: user._id });
        const now = new Date();

        const totalBookings = bookings.length;
        const upcomingPujas = bookings.filter(booking =>
            booking.status === "confirmed" &&
            new Date(booking.bookingDate) >= now
        ).length;
        const completedBookings = bookings.filter(
            booking => booking.status === "completed"
        ).length;
        const pendingBookings = bookings.filter(
            booking => booking.status === "pending"
        ).length;

        return res.status(200).json({
            success: "Dashboard loaded successfully.",
            user,
            stats: {
                totalBookings,
                upcomingPujas,
                completedBookings,
                pendingBookings
            }
        });
    } catch (error) {
        console.error("Dashboard error:", error);
        return res.status(500).json({
            error: "Failed to fetch dashboard data."
        });
    }
});



module.exports = UserRouter;
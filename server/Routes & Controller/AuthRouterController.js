
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const Pandit = require("../Models/Pandit");
const TokenAuthMiddleware = require("../Middleware/TokenAuthMiddleware");
const AuthRouter = express.Router();

AuthRouter.post("/login", async (req, res) => {
    try {
        const token = req.cookies.auth_token;
        if (token) {
            try {
                jwt.verify(token, process.env.JWT_SECRET_KEY);
                return res.json({ warning: "You're already logged in." });
            } catch {
                res.clearCookie("auth_token", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                    path: "/"
                });
            }
        }
        const { email, password, role, rememberMe } = req.body;

        if (!email || !password || !["user", "pandit", "admin"].includes(role)) {
            return res.status(400).json({ error: "Please provide valid login details." });
        }

        if (!process.env.JWT_SECRET_KEY) {
            return res.status(500).json({ error: "Server authentication is not configured." });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const expiresIn = rememberMe === true ? "7d" : "1d";
        let checkAccount;
        let Usertoken;

        if (role === "user") {
            checkAccount = await User.findOne({ email: normalizedEmail });
            if (!checkAccount) {
                return res.json({ error: "You're not register. Please register" });
            }
            const checkPassword = await bcrypt.compare(password, checkAccount.password)
            if (!checkPassword) {
                return res.json({ error: "Invalid credentials" })
            }

            Usertoken = jwt.sign({ id: checkAccount._id, email: checkAccount.email, role: "user" }, process.env.JWT_SECRET_KEY, { expiresIn: expiresIn });
        }
        else if (role === "pandit") {
            checkAccount = await Pandit.findOne({ email: normalizedEmail });
            if (!checkAccount) {
                return res.json({ error: "You're not register. Please register" });
            }
            const checkPassword = await bcrypt.compare(password, checkAccount.password)
            if (!checkPassword) {
                return res.json({ error: "Invalid credentials" })
            }

            Usertoken = jwt.sign({ id: checkAccount._id, email: checkAccount.email, role: "pandit" }, process.env.JWT_SECRET_KEY, { expiresIn: expiresIn });
        }
        else if (role === "admin") {
            if (normalizedEmail !== process.env.ADMIN_EMAIL?.trim().toLowerCase() || password !== process.env.ADMIN_PASSWORD) {
                return res.json({ error: "Invalid credentials" })
            }
            Usertoken = jwt.sign({ email: process.env.ADMIN_EMAIL, role: "admin" }, process.env.JWT_SECRET_KEY, { expiresIn: expiresIn });
        }



        const maxAge = rememberMe === true
            ? 7 * 24 * 60 * 60 * 1000
            : 24 * 60 * 60 * 1000;

        res.cookie("auth_token", Usertoken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
            maxAge
        });

        return res.status(200).json({
            success: "Login successful.",
            role: role,
        })
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Something went wrong. Please try again." });
    }
});


AuthRouter.get('/me', TokenAuthMiddleware, async (req, res) => {
    try {
        res.status(200).json({
            role: req.role,
            user: req.user
        })

    }
    catch (e) {
        console.error("Failed to User server: ", e)
        return res.status(500).json({ error: "Failed to user server" })
    }
})

AuthRouter.post('/logout', (req, res) => {
    try {
        res.clearCookie("auth_token", {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
        });

        return res.status(200).json({
            success: "User logout successfully"
        });
    }
    catch (e) {
        console.error("Logout Error:", e);
        return res.status(500).json({
            error: "Logout failed"
        });
    }
})

module.exports = AuthRouter;

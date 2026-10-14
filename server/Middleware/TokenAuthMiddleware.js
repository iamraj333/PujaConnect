const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Pandit = require('../Models/Pandit')
require('dotenv').config()

const TokenAuthMiddleware = async (req, res, next) => {
    const token = req.cookies.auth_token
    if (!token) {
        return res.status(401).json({ error: "Token is not found" })
    }
    else {

        try {
            const decodeToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
            if (decodeToken.role == "user") {
                const currentUser = await User.findOne({ _id: decodeToken.id }).select("-password");
                if (!currentUser) {
                    return res.status(400).json({ error: "User not found" });
                }
                req.user = currentUser;
                req.role = "user"
                return next();
            }

            if (decodeToken.role == "pandit") {
                const currentUser = await Pandit.findOne({ _id: decodeToken.id }).select("-password");
                if (!currentUser) {
                    return res.status(400).json({ error: "Pandit not found" })
                }

                req.user = currentUser;
                req.role = "pandit"
                return next();
            }

            if (decodeToken.role === "admin") {
                req.user = { name: "Admin", email: process.env.ADMIN_EMAIL }
                req.role = "admin";
                return next();
            }

            return res.json({ error: "Invalid user role" });
        }
        catch (e) {
            console.error("Invalid token: ",e)
            return res.json({error:"Token is invalid or expired"});
        }
    }
}

module.exports = TokenAuthMiddleware
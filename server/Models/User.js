const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    address: { house: String, street: String, area: String, city: String, state: String, pincode: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model("User", UserSchema)
module.exports = User
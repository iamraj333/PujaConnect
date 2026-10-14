const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId,ref: "User",required: true},
    pandits: [{type: mongoose.Schema.Types.ObjectId,ref: "Pandit"}],
    selectedPandit: {type: mongoose.Schema.Types.ObjectId,ref: "Pandit",default: null},
    ritual: {type: mongoose.Schema.Types.ObjectId,ref: "Ritual",required: true},
    bookingDate: {type: Date,required: true},
    startTime: {type: String,required: true},
    locationType: {type: String,enum: ["home", "temple"],required: true},
    address: {
        house: String,
        street: String,
        area: String,
        city: String,
        state: String,
        pincode: String
    },
    price: {type: Number,required: true},
    status: {type: String,enum: ["pending", "confirmed", "rejected", "cancelled", "completed"],default: "pending"},
    notes: {type: String,default: ""}
}, {timestamps: true});

const Booking= mongoose.model("Booking", BookingSchema);
module.exports=Booking
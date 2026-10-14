const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId,ref: "User",required: true},
    pandit: {type: mongoose.Schema.Types.ObjectId,ref: "Pandit",required: true},
    booking: {type: mongoose.Schema.Types.ObjectId,ref: "Booking",required: true},
    rating: {type: Number,min: 1,max: 5},
    comment: {type: String,default: ""}
}, {
    timestamps: true
});

const Feedback = mongoose.model("Feedback", FeedbackSchema);
module.exports=Feedback
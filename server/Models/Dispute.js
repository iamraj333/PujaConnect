const mongoose = require("mongoose");

const DisputeSchema = new mongoose.Schema({
    booking: {type: mongoose.Schema.Types.ObjectId,ref: "Booking",required: true},
    raisedBy: {type: String,enum: ["user", "pandit"],required: true},
    user: {type: mongoose.Schema.Types.ObjectId,ref: "User",required: true},
    pandit: {type: mongoose.Schema.Types.ObjectId,ref: "Pandit",required: true},
    subject: {type: String,required: true},
    description: {type: String,required: true},
    status: {type: String,enum: ["open", "under_review", "resolved", "rejected"],default: "open"},
    resolution: {type: String,default: ""}
}, {timestamps: true});

const Dispute = mongoose.model("Dispute", DisputeSchema);
module.exports=Dispute
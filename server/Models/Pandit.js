const mongoose = require("mongoose");

const PanditSchema = new mongoose.Schema({
    name: {type: String,required: true,trim: true},
    email: {type: String,required: true,unique: true,trim: true,lowercase: true},
    password: {type: String,required: true},
    phone: {type: String,required: true},
    profileImage: {type: String,default: ""},
    bio: {type: String,default: ""},
    location: {
        city: {type: String,required: true},
        state: {type: String,required: true},
        pincode: {type: String,required: true}
    },
    experience: {type: Number,required: true,min: 0},
    languages: [{type: String}],
    idProof: {type: String, required: true},
    rituals: [{type: mongoose.Schema.Types.ObjectId,ref: "Ritual"}],
    availability: {type: Boolean,default: true},
    verificationStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending"},
    isActive: {type: Boolean,default: true}
}, {timestamps: true});

const Pandit= mongoose.model("Pandit", PanditSchema);
module.exports=Pandit
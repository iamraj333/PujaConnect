const mongoose = require("mongoose");

const RitualSchema = new mongoose.Schema({
    name: {type: String,required: true,unique: true,trim: true},
    description: {type: String,required: true},
    duration: {type: Number,required: true},
    requiredMaterials: [{type: String}],
    priceRange: {
        min: { type: Number,required: true},
        max: {type: Number,required: true}
    },
    locationType: [{type: String,enum: ["home", "temple"]}],
    isActive: {type: Boolean,default: true}
}, {timestamps: true});

const Ritual= mongoose.model("Ritual", RitualSchema);
module.exports=Ritual
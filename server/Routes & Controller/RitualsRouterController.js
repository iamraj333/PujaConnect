
const express = require("express");
const Ritual = require("../Models/Ritual");
const TokenAuthMiddleware = require("../Middleware/TokenAuthMiddleware");

const RitualRouter = express.Router();

// Get all rituals for admin
RitualRouter.get("/all", async(req, res) => {
    try {
        const rituals = await Ritual.find().sort({ createdAt: -1 });
        return res.status(200).json({ rituals });
    } catch (error) {
        console.error("Fetch rituals error:", error);
        return res.status(500).json({ error: "Failed to fetch rituals." });
    }
});

// Add ritual
RitualRouter.post("/create", TokenAuthMiddleware, async (req, res) => {
    if (req.role !== "admin") {
        return res.status(403).json({ error: "Access denied." });
    }
    try {
        const { name, description, duration, requiredMaterials, priceRange, locationType, isActive } = req.body;

        if (!name?.trim() || !description?.trim() || !Number.isFinite(Number(duration)) || Number(duration) <= 0 || !priceRange || !Number.isFinite(Number(priceRange.min)) || !Number.isFinite(Number(priceRange.max)) || Number(priceRange.min) < 0 || Number(priceRange.max) < Number(priceRange.min)) {
            return res.status(400).json({ error: "Please provide valid ritual details." });
        }

        if (!Array.isArray(locationType) || locationType.length === 0 || locationType.some(location => !["home", "temple"].includes(location))) {
            return res.status(400).json({ error: "Select at least one valid location." });
        }

        const ritual = await Ritual.create({
            name: name.trim(),
            description: description.trim(),
            duration: Number(duration),
            requiredMaterials: Array.isArray(requiredMaterials) ? requiredMaterials : [],
            priceRange: {
                min: Number(priceRange.min),
                max: Number(priceRange.max)
            },
            locationType,
            isActive: isActive ?? true
        });

        return res.status(201).json({ success: "Ritual created successfully.", ritual });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ error: "A ritual with this name already exists." });
        }
        console.error("Create ritual error:", error);
        return res.status(500).json({ error: "Failed to create ritual." });
    }
});

// Update ritual
RitualRouter.put("/update/:id", TokenAuthMiddleware, async (req, res) => {
    if (req.role !== "admin") {
        return res.status(403).json({ error: "Access denied." });
    }
    try {
        const { name, description, duration, requiredMaterials, priceRange, locationType, isActive } = req.body;

        if (!name?.trim() || !description?.trim() || !Number.isFinite(Number(duration)) || Number(duration) <= 0 || !priceRange || !Number.isFinite(Number(priceRange.min)) || !Number.isFinite(Number(priceRange.max)) || Number(priceRange.min) < 0 || Number(priceRange.max) < Number(priceRange.min)) {
            return res.status(400).json({ error: "Please provide valid ritual details." });
        }

        if (!Array.isArray(locationType) || locationType.length === 0 || locationType.some(location => !["home", "temple"].includes(location))) {
            return res.status(400).json({ error: "Select at least one valid location." });
        }

        const ritual = await Ritual.findByIdAndUpdate(
            req.params.id,
            {
                name: name.trim(),
                description: description.trim(),
                duration: Number(duration),
                requiredMaterials: Array.isArray(requiredMaterials) ? requiredMaterials : [],
                priceRange: {
                    min: Number(priceRange.min),
                    max: Number(priceRange.max)
                },
                locationType,
                isActive: isActive ?? true
            },
            { new: true, runValidators: true }
        );

        if (!ritual) {
            return res.status(404).json({ error: "Ritual not found." });
        }

        return res.status(200).json({ success: "Ritual updated successfully.", ritual });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ error: "A ritual with this name already exists." });
        }
        console.error("Update ritual error:", error);
        return res.status(500).json({ error: "Failed to update ritual." });
    }
});

// Delete ritual
RitualRouter.delete("/delete/:id", TokenAuthMiddleware, async (req, res) => {
    if (req.role !== "admin") {
        return res.status(403).json({ error: "Access denied." });
    }
    try {
        const ritual = await Ritual.findByIdAndDelete(req.params.id);
        if (!ritual) {
            return res.status(404).json({ error: "Ritual not found." });
        }
        return res.status(200).json({ success: "Ritual deleted successfully." });
    } catch (error) {
        console.error("Delete ritual error:", error);
        return res.status(500).json({ error: "Failed to delete ritual." });
    }
});

module.exports = RitualRouter;

const Announcement = require("../models/Announcement");
const createAnnouncement = async (req, res) => {
    try {
        const { title, message } = req.body;
        const announcement = await Announcement.create({
            title,
            message,
            createdBy: req.user.id
        });
        req.io.to("students").emit(
            "new-announcement",
            {
                id: announcement._id,
                title: announcement.title,
                message: announcement.message,
                createdAt: announcement.createdAt
            }
        );
        res.status(201).json({
            message: "Announcement created successfully",
            announcement
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create announcement",
            error: error.message
        });
    }
};
module.exports = {
    createAnnouncement
};
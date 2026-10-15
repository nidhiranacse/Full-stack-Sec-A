const express = require("express");

const Event = require("../models/Event");
const Registration = require("../models/Registration");

const { auth, adminOnly } =
    require("../middleware/auth");

const router = express.Router();


router.get("/analytics", auth, adminOnly, async (req, res) => {

    try {

        const totalEvents =
            await Event.countDocuments();

        const totalRegistrations =
            await Registration.countDocuments();

        res.json({
            totalEvents,
            totalRegistrations
        });

    } catch (error) {

        res.status(500).json({
            message: "Analytics unavailable"
        });
    }
});


// STUDENTS REGISTERED FOR EVENT
router.get(
    "/events/:id/students",
    auth,
    adminOnly,
    async (req, res) => {

        try {

            const students =
                await Registration.find({
                    event: req.params.id
                })
                .populate(
                    "student",
                    "name email"
                );

            res.json(students);

        } catch (error) {

            res.status(500).json({
                message: "Unable to fetch students"
            });
        }
    }
);


module.exports = router;
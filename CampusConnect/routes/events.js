const express = require("express");

const Event = require("../models/Event");
const Registration = require("../models/Registration");

const { auth, adminOnly } =
    require("../middleware/auth");

const router = express.Router();


// GET EVENTS + SEARCH + FILTER
router.get("/", async (req, res) => {

    try {

        const {
            search,
            category
        } = req.query;

        let query = {};

        if (search) {
            query.name = {
                $regex: search,
                $options: "i"
            };
        }

        if (category) {
            query.category = category;
        }

        const events = await Event.find(query)
            .sort({ date: 1 });

        res.json(events);

    } catch (error) {

        res.status(500).json({
            message: "Unable to fetch events"
        });
    }
});


// CREATE EVENT - ADMIN
router.post("/", auth, adminOnly, async (req, res) => {

    try {

        const event = await Event.create(req.body);

        res.status(201).json({
            message: "Event created",
            event
        });

    } catch (error) {

        res.status(400).json({
            message: "Invalid event data"
        });
    }
});


// UPDATE EVENT
router.put("/:id", auth, adminOnly, async (req, res) => {

    try {

        const event =
            await Event.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.json(event);

    } catch (error) {

        res.status(500).json({
            message: "Update failed"
        });
    }
});


// DELETE EVENT
router.delete("/:id", auth, adminOnly, async (req, res) => {

    try {

        const event =
            await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        await Registration.deleteMany({
            event: req.params.id
        });

        res.json({
            message: "Event deleted"
        });

    } catch (error) {

        res.status(500).json({
            message: "Delete failed"
        });
    }
});


// REGISTER FOR EVENT
router.post("/:id/register", auth, async (req, res) => {

    try {

        const event =
            await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        if (event.registeredSeats >= event.seats) {
            return res.status(400).json({
                message: "No seats available"
            });
        }

        const alreadyRegistered =
            await Registration.findOne({
                student: req.user.id,
                event: event._id
            });

        if (alreadyRegistered) {
            return res.status(400).json({
                message: "Already registered"
            });
        }

        await Registration.create({
            student: req.user.id,
            event: event._id
        });

        event.registeredSeats += 1;

        await event.save();

        res.json({
            message: "Event registration successful"
        });

    } catch (error) {

        res.status(500).json({
            message: "Registration failed"
        });
    }
});


// UNREGISTER
router.delete("/:id/register", auth, async (req, res) => {

    try {

        const registration =
            await Registration.findOneAndDelete({
                student: req.user.id,
                event: req.params.id
            });

        if (!registration) {
            return res.status(404).json({
                message: "Registration not found"
            });
        }

        await Event.findByIdAndUpdate(
            req.params.id,
            { $inc: { registeredSeats: -1 } }
        );

        res.json({
            message: "Unregistered successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Unregistration failed"
        });
    }
});


// MY EVENTS
router.get("/my/events", auth, async (req, res) => {

    try {

        const registrations =
            await Registration.find({
                student: req.user.id
            }).populate("event");

        res.json(registrations);

    } catch (error) {

        res.status(500).json({
            message: "Unable to fetch registrations"
        });
    }
});


module.exports = router;
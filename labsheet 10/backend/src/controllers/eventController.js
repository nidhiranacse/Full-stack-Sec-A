const Event =
    require('../models/Event');

const {
    invalidateEventsCache
} = require('../middleware/cache');


// GET EVENTS
async function listEvents(
    req,
    res
) {

    const page =
        Math.max(
            Number(req.query.page) || 1,
            1
        );

    const limit =
        Math.min(
            Math.max(
                Number(req.query.limit) || 10,
                1
            ),
            50
        );

    const search =
        (req.query.search || '').trim();


    const filter =
        search
            ? {
                title: {
                    $regex: search,
                    $options: 'i'
                }
            }
            : {};


    const total =
        await Event.countDocuments(
            filter
        );


    const totalPages =
        Math.max(
            Math.ceil(
                total / limit
            ),
            1
        );


    const items =
        await Event.find(filter)
            .sort({
                date: 1
            })
            .skip(
                (page - 1) * limit
            )
            .limit(limit)
            .lean();


    return res.json({
        items,
        page,
        totalPages,
        total
    });
}


// CREATE EVENT
async function createEvent(
    req,
    res
) {

    const {
        title,
        description,
        date,
        venue
    } = req.body;


    const event =
        await Event.create({
            title,
            description,
            date,
            venue,
            createdBy: req.user.sub
        });


    await invalidateEventsCache();


    return res.status(201).json(
        event
    );
}


// UPDATE EVENT
async function updateEvent(
    req,
    res
) {

    const event =
        await Event.findByIdAndUpdate(
            req.params.id,

            {
                title:
                    req.body.title,

                description:
                    req.body.description,

                date:
                    req.body.date,

                venue:
                    req.body.venue
            },

            {
                new: true,
                runValidators: true
            }
        );


    if (!event) {

        return res.status(404).json({
            error:
                'Event not found'
        });
    }


    await invalidateEventsCache();


    return res.json(event);
}


// DELETE EVENT
async function deleteEvent(
    req,
    res
) {

    const event =
        await Event.findByIdAndDelete(
            req.params.id
        );


    if (!event) {

        return res.status(404).json({
            error:
                'Event not found'
        });
    }


    await invalidateEventsCache();


    return res.json({
        message:
            'Event deleted successfully'
    });
}


// RSVP
async function rsvp(
    req,
    res
) {

    const event =
        await Event.findById(
            req.params.id
        );


    if (!event) {

        return res.status(404).json({
            error:
                'Event not found'
        });
    }


    const alreadyRegistered =
        event.rsvps.some(
            (id) =>
                id.toString() ===
                req.user.sub
        );


    if (!alreadyRegistered) {

        event.rsvps.push(
            req.user.sub
        );

        await event.save();
    }


    await invalidateEventsCache();


    return res.json(event);
}


module.exports = {
    listEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    rsvp
};
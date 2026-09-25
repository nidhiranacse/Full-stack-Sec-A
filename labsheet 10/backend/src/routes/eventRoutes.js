const express =
    require('express');

const {
    z
} = require('zod');

const {
    authenticate,
    authorize
} = require('../middleware/auth');

const validate =
    require('../middleware/validate');

const {
    cacheEvents
} = require('../middleware/cache');

const {
    listEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    rsvp
} = require('../controllers/eventController');


const router =
    express.Router();


const eventSchema =
    z.object({

        title:
            z.string()
                .min(2)
                .max(200),

        description:
            z.string()
                .max(1000)
                .optional()
                .default(''),

        date:
            z.coerce.date(),

        venue:
            z.string()
                .max(200)
                .optional()
                .default('')
    });


router.get(
    '/',
    authenticate,
    cacheEvents,
    listEvents
);


router.post(
    '/',
    authenticate,
    authorize('ADMIN'),
    validate({
        body: eventSchema
    }),
    createEvent
);


router.put(
    '/:id',
    authenticate,
    authorize('ADMIN'),
    validate({
        body: eventSchema
    }),
    updateEvent
);


router.delete(
    '/:id',
    authenticate,
    authorize('ADMIN'),
    deleteEvent
);


router.post(
    '/:id/rsvp',
    authenticate,
    authorize('STUDENT'),
    rsvp
);


module.exports = router;
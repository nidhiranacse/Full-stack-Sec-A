const redisClient =
    require('../config/redis');

const EVENTS_CACHE_KEY_PREFIX =
    'events:list:';

const EVENTS_TTL_SECONDS = 60;


function cacheEvents(
    req,
    res,
    next
) {

    const cacheKey =
        EVENTS_CACHE_KEY_PREFIX +
        JSON.stringify(req.query);


    redisClient
        .get(cacheKey)

        .then((cached) => {

            if (cached) {

                res.set(
                    'X-Cache',
                    'HIT'
                );

                return res
                    .status(200)
                    .json(
                        JSON.parse(cached)
                    );
            }


            res.set(
                'X-Cache',
                'MISS'
            );


            const originalJson =
                res.json.bind(res);


            res.json = (body) => {

                redisClient
                    .set(
                        cacheKey,
                        JSON.stringify(body),
                        'EX',
                        EVENTS_TTL_SECONDS
                    )
                    .catch((error) => {
                        console.error(
                            'Redis SET error:',
                            error.message
                        );
                    });

                return originalJson(body);
            };


            next();
        })

        .catch((error) => {

            console.error(
                'Redis GET error:',
                error.message
            );

            next();
        });
}


async function invalidateEventsCache() {

    const keys =
        await redisClient.keys(
            `${EVENTS_CACHE_KEY_PREFIX}*`
        );

    if (keys.length) {
        await redisClient.del(
            ...keys
        );
    }
}


module.exports = {
    cacheEvents,
    invalidateEventsCache,
    EVENTS_TTL_SECONDS
};
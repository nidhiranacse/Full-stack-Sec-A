const express = require("express");
const { z } = require("zod");
const Event = require("../models/Event");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();
const cache = new Map();
const CACHE_TIME = 60000;

const eventSchema = z.object({
title: z.string().trim().min(1),
description: z.string().min(1),
date: z.string().min(1),
location: z.string().trim().min(1)
});

function clearCache() {
cache.clear();
}

router.get("/", async (req, res) => {
try {
const page = Math.max(1, Number(req.query.page) || 1);
const limit = 5;
const search = String(req.query.search || "").trim();
const key = `${page}:${search.toLowerCase()}`;
const cached = cache.get(key);

```
if (cached && Date.now() - cached.time < CACHE_TIME) {
  return res.json({ ...cached.data, cached: true });
}

const filter = search ? { title: { $regex: search, $options: "i" } } : {};
const total = await Event.countDocuments(filter);
const events = await Event.find(filter)
  .sort({ date: 1 })
  .skip((page - 1) * limit)
  .limit(limit)
  .populate("createdBy", "name");

const data = {
  events,
  page,
  totalPages: Math.ceil(total / limit),
  total
};

cache.set(key, { data, time: Date.now() });
res.json({ ...data, cached: false });
```

} catch {
res.status(500).json({ message: "Could not retrieve events" });
}
});

router.post("/", authenticate, authorize("ADMIN"), async (req, res) => {
try {
const result = eventSchema.safeParse(req.body);

```
if (!result.success || Number.isNaN(Date.parse(result.data?.date))) {
  return res.status(400).json({ message: "Invalid event details" });
}

const event = await Event.create({
  ...result.data,
  createdBy: req.user.id
});

clearCache();
res.status(201).json({ message: "Event created", event });
```

} catch {
res.status(500).json({ message: "Could not create event" });
}
});

router.put("/:id", authenticate, authorize("ADMIN"), async (req, res) => {
try {
const result = eventSchema.partial().safeParse(req.body);

```
if (!result.success) {
  return res.status(400).json({ message: "Invalid event details" });
}

const event = await Event.findByIdAndUpdate(
  req.params.id,
  result.data,
  { new: true, runValidators: true }
);

if (!event) return res.status(404).json({ message: "Event not found" });

clearCache();
res.json({ message: "Event updated", event });
```

} catch {
res.status(500).json({ message: "Could not update event" });
}
});

router.delete("/:id", authenticate, authorize("ADMIN"), async (req, res) => {
try {
const event = await Event.findByIdAndDelete(req.params.id);

```
if (!event) return res.status(404).json({ message: "Event not found" });

clearCache();
res.json({ message: "Event deleted" });
```

} catch {
res.status(500).json({ message: "Could not delete event" });
}
});

router.post("/:id/rsvp", authenticate, async (req, res) => {
try {
const event = await Event.findById(req.params.id);

```
if (!event) return res.status(404).json({ message: "Event not found" });

const userId = req.user.id;
const alreadyJoined = event.attendees.some(id => id.toString() === userId);

if (alreadyJoined) {
  event.attendees.pull(userId);
} else {
  event.attendees.addToSet(userId);
}

await event.save();
clearCache();

res.json({
  message: alreadyJoined ? "RSVP cancelled" : "RSVP successful",
  attendees: event.attendees.length
});
```

} catch {
res.status(500).json({ message: "RSVP failed" });
}
});

module.exports = router;

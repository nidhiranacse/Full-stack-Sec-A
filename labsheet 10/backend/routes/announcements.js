const express = require("express");
const { z } = require("zod");
const Announcement = require("../models/Announcement");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
try {
const announcements = await Announcement.find()
.sort({ createdAt: -1 })
.populate("createdBy", "name");

```
res.json({ announcements });
```

} catch {
res.status(500).json({ message: "Could not retrieve announcements" });
}
});

router.post("/", authenticate, authorize("ADMIN"), async (req, res) => {
const schema = z.object({
title: z.string().trim().min(1),
message: z.string().trim().min(1)
});

const result = schema.safeParse(req.body);

if (!result.success) {
return res.status(400).json({ message: "Invalid announcement details" });
}

try {
const announcement = await Announcement.create({
...result.data,
createdBy: req.user.id
});

```
const io = req.app.get("io");
io.to("STUDENT").emit("new-announcement", announcement);

res.status(201).json({ message: "Announcement published", announcement });
```

} catch {
res.status(500).json({ message: "Could not publish announcement" });
}
});

module.exports = router;

const { z } = require("zod");

const eventSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters"),

  description: z
    .string()
    .min(5, "Description must be at least 5 characters"),

  date: z
    .string()
    .refine(
      (value) => !isNaN(Date.parse(value)),
      "Invalid date"
    ),

  location: z
    .string()
    .min(2, "Location is required"),
});

module.exports = {
  eventSchema,
};
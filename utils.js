function dateString(value) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = new Date(`${value}T00:00:00.000Z`);

    if (
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value
    ) {
      return value;
    }
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date.");
  }

  return date.toISOString().slice(0, 10);
}

function addDays(value, days) {
  const date = new Date(`${dateString(value)}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function calculateFine(dueDate, returnedOn) {
  const due = new Date(`${dateString(dueDate)}T00:00:00.000Z`);
  const returned = new Date(`${dateString(returnedOn)}T00:00:00.000Z`);

  const daysLate = Math.max(
    0,
    Math.floor((returned.getTime() - due.getTime()) / 86400000)
  );

  return daysLate * 2;
}

module.exports = { dateString, addDays, calculateFine };
function calculateFine(dueOn, returnedOn = new Date()) {
  const due = new Date(`${dueOn}T00:00:00Z`);
  const returned = returnedOn instanceof Date ? returnedOn : new Date(`${returnedOn}T00:00:00Z`);
  const days = Math.floor((Date.UTC(returned.getUTCFullYear(), returned.getUTCMonth(), returned.getUTCDate()) -
    Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate())) / 86400000);
  return Math.max(0, days) * 2;
}
module.exports = { calculateFine };

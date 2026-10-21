export const holidays2026 = [
  { date: "2026-01-01", name: "New year" },
  { date: "2026-01-15", name: "Sankranthi" },
  { date: "2026-01-26", name: "Republic Day" },
  { date: "2026-03-19", name: "Ugadi" },
  { date: "2026-05-01", name: "May day/labours day" },
  { date: "2026-06-02", name: "Telangana Formation Day" },
  { date: "2026-09-14", name: "Vinayaka Chaturthi" },
  { date: "2026-10-02", name: "Gandhi Jayanti" },
  { date: "2026-10-20", name: "Dussehra" },
  { date: "2026-11-09", name: "Diwali" },
  { date: "2026-12-25", name: "Christmas" },
];

export function getHolidayForDate(date) {
  const dateKey = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

  return holidays2026.find((holiday) => holiday.date === dateKey);
}

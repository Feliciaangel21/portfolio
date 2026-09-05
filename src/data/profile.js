// When you started building, used for the "Years building" figure. This is the
// one number on the site that is not read from the database, so it lives here
// rather than being repeated on every page that shows it.
export const START_DATE = new Date("2021-11-06");

export const yearsBuilding = (today = new Date()) => {
  const anniversary = new Date(
    today.getFullYear(),
    START_DATE.getMonth(),
    START_DATE.getDate()
  );
  return today.getFullYear() - START_DATE.getFullYear() - (today < anniversary ? 1 : 0);
};

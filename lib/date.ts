export const getTodayDate = () => {
  return new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
  );
};

export const getNextDayDate = () => {
  const today = getTodayDate();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
};

export const getNextWeekDate = () => {
  const today = getTodayDate();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
};

export const getNextMonthDate = () => {
  const today = getTodayDate();
  return new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
};

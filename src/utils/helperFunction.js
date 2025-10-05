//functions to be used with in other funcitons
const trimAndLower = (input) => {
  return input.trim().toLowerCase();
};

const capitalize = (input) => {
  let trimmedAndLower = trimAndLower(input);

  return trimmedAndLower
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
};

const isEmailValid = (email = "") => {
  if (typeof email !== "string") return false;
  const cleaned = trimAndLower(email);
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleaned);
};

export { trimAndLower, capitalize, isEmailValid };

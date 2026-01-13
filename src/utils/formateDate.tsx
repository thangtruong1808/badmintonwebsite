const date = new Date();

const weekday = date.toLocaleDateString("en-GB", { weekday: "long" });
const day = date.toLocaleDateString("en-GB", { day: "2-digit" });
const month = date.toLocaleDateString("en-GB", { month: "short" });
const year = date.getFullYear();

export const finalDate = `${weekday}, ${day}-${month}-${year}`;

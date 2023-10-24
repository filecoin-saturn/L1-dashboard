const MAGNITUDE_SUFFIXES = ["", "k", "M", "G", "T", "P", "E", "Z"];

export const shortenNumber = (num: number) => {
  let unitIndex = 0;

  while (num >= 1000) {
    num /= 1000;
    unitIndex++;
  }

  return Math.floor(num) + MAGNITUDE_SUFFIXES[unitIndex];
};

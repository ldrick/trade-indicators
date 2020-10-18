export const avg = (values: number[]): number =>
  values.reduce((accumulator, current) => accumulator + current, 0) / values.length;

export class NotEnoughDataError extends Error {
  constructor(indicator: string, period: number, min: number) {
    super(
      `Not enough data to calculate ${indicator}. Need at least ${min} values for period size ${period}`,
    );
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'NotEnoughDataError';
  }
}

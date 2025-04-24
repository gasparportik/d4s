import { range, pickRandom, between } from './util';

describe("range", () => {
  it("should return a generator", () => {
    const result = range(1, 10);
    expect(result.toString()).toContain('Generator');
  });
});

describe("pickRandom", () => {
  it("should not fail on empty arrays", () => {
    const result = pickRandom([]);
    console.log(result);
  });
});

describe("between", () => {
  it("should not fail on invalid range", () => {
    expect(between(null, 5)).toEqual(5);
  });
});

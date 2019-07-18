import { calculateRollRange, parseCombinationString, evaluateRolls, randomRoll } from './dice';
const inputD6: DiceConfig = { dice: [{ sides: [1, 2, 3, 4, 5, 6], die: 'd6', sign: 1 }], bonus: 0 };

describe("calculateRollRange", () => {
  it("should produce valid results", () => {
    const range = calculateRollRange(inputD6);
    expect(range[0]).toEqual(1);
    expect(range[1]).toEqual(6);
  });
});

describe("parseCombinationString", () => {
  it("should produce valid results", () => {
    const result = parseCombinationString("2d4+3");
    console.log(result);
  });
});

describe("evaluateRolls", () => {
  it("should produce valid results", () => {
    const result = evaluateRolls(inputD6);
    console.log(result);
  });
});

describe("randomRoll", () => {
  it("should produce valid results", () => {
    const result = randomRoll(inputD6);
    console.log(result);
  });
});

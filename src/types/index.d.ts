type Point = {
    x: number;
    y: number;
}

type Die = {
    die: string;
    sides: number[];
    sign: 1 | -1;
};

type Roll = {
    value: number;
    count: number;
    chance: number
};

type DiceConfig = {
    dice: Die[];
    bonus: number;
    range?: number[];
}

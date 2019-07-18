import { knownDice } from './config';
import { pickRandom, range, between } from './util';


export function calculateRollRange(dc: DiceConfig) {
    let min = dc.bonus;
    let max = dc.bonus;
    dc.dice.forEach((d) => {
        if (d.sign > 0) {
            min += Math.min(...d.sides);
            max += Math.max(...d.sides);
        } else {
            min -= Math.max(...d.sides);
            max -= Math.min(...d.sides);
        }
    });
    return [min, max];
}

export function parseCombinationString(ds: string): DiceConfig {
    let bonus = 0;
    const dice: Die[] = [];
    let pos = 0;
    let bounds: number[] = [];
    const rangeMatch = /\[(-?[0-9]*),(-?[0-9]*)\]/.exec(ds);
    if (rangeMatch !== null) {
        const [, low, high] = rangeMatch;
        if (low !== '') {
            bounds[0] = +low;
        }
        if (high !== '') {
            bounds[1] = +high;
        }
    }
    ds.replace(/\[[^\]]*\]/g, '').split(/[+\-]/).forEach((d) => {
        const match = /^ *([1-9]?)([dxk])([0-9]+) *$/.exec(d);
        const sign = pos === 0 || ds[pos - 1] === "+" ? 1 : -1;
        if (match) {
            const [, count, sourceType, sideCount] = match;
            const type = sourceType === 'k' ? 'd' : sourceType;
            const [low, high, step = 1] = knownDice[type + sideCount] || [1, sideCount];
            const sides = [...range(low, high, step)];
            dice.push(...Array(+count || 1).fill({ sign, die: sourceType + sideCount, sides }));
        } else if (!isNaN(+d)) {
            bonus += sign * +d;
        }
        pos += d.length + 1;
    });
    if (rangeMatch && (bounds[0] === undefined || bounds[1] === undefined)) {
        const calcRange = calculateRollRange({ dice, bonus, range: bounds });
        if (bounds[0] === undefined) {
            bounds[0] = calcRange[0];
        }
        if (bounds[1] === undefined) {
            bounds[1] = calcRange[1];
        }
    }
    return { bonus, dice, range: bounds };
}

export function evaluateRolls(dc: DiceConfig) {
    let temp = dc.dice.slice(1)
        .reduce<number[]>((a, d) => {
            return ([] as number[]).concat(...d.sides.map(s => a.map(r => r + d.sign * s)));
        }, dc.dice.length > 0 ? dc.dice[0].sides.map(v => v + dc.bonus) : []);
    const total = temp.length;
    const ur: { [key: number]: Roll } = {};
    temp.forEach(r => {
        if (dc.range) {
            if (r < dc.range[0]) {
                r = dc.range[0];
            } else if (r > dc.range[1]) {
                r = dc.range[1];
            }
        }
        if (ur[r]) {
            ur[r].count += 1;
        } else {
            ur[r] = { value: r, count: 1, chance: 0 };
        }
    });
    const rolls = Object.values(ur).map((r) => ({ ...r, chance: 100 * r.count / total })).sort((a, b) => a.value - b.value);
    const [min, max] = calculateRollRange(dc);
    // const average = temp.reduce((a, r) => a + r.v / total, 0) + bonus;
    const average = (min + max) / 2;
    return { min, average, max, total, rolls };
}

export function randomRoll(dc: DiceConfig, valueOnly = false) {
    if (valueOnly) {
        const value = dc.dice.reduce((a, d) => a + (pickRandom(d.sides) * d.sign), dc.bonus);
        return { value: between(dc.range, value) };
    } else {
        const dice = dc.dice.map((d) => pickRandom(d.sides) * d.sign);
        const value = dice.reduce((a, v) => a + v, dc.bonus);
        return { dice, value: between(dc.range, value) };
    }
}

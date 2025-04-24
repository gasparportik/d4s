export function* range(from: number, to: number, step = 1) {
    while (from <= to) {
        yield from;
        from += step;
    }
}

export function between(range: number[] | undefined | null, value: number): number {
    if (!range || range.length !== 2) {
        return value;
    }
    return Math.max(range[0], Math.min(range[1], value));
}

export function pickRandom<T>(array: T[]) {
    return array[Math.floor(Math.random() * array.length)];
}

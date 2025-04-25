export function formatAge(seconds: number) {
    const secs = Math.floor(seconds );
    if (secs < 1) {
        return 'now';
    }
    if (secs < 60) {
        return `${secs} seconds ago`;
    }
    if (secs < 3600) {
        return `${Math.floor(secs / 60)} minutes ago`;
    }
    return 'a long time ago';
}

export function formatNumberMetric(number: number): string {
    if (number < 1000) {
        return number + '';
    }
    let suffix = 'k';
    number /= 1000;
    if (number > 1000) {
        suffix = 'm';
        number /= 1000;
    }
    if (number > 1000) {
        suffix = 'g';
        number /= 1000;
    }
    return number.toFixed(1) + suffix;
}


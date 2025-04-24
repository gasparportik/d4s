export function formatAge(seconds: number) {
    if (seconds < 1) {
        return 'now';
    }
    if (seconds < 60) {
        return `${seconds} seconds ago`;
    }
    if (seconds < 3600) {
        return `${Math.floor(seconds / 60)} minutes ago`;
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


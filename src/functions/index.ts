export * from './dice';
export * from './chart';
export * from './formatting';

const historyLimit = 1000;
let programmaticHashUpdate = false;

export function parseParams(): Record<string, string> {
    const hash = location.hash;
    const hashParams = hash.substr(1).split('&').filter(c => !!c);
    const result: Record<string, string> = {};
    hashParams.forEach((p) => {
        const [key, value] = p.split('=', 2);
        result[key] = unescape(value);
    });
    return result;
}

export function updateParams(params: Record<string, string>) {
    const oldParams = parseParams();
    const combined = Object.assign(oldParams, params);
    const parts = Object.keys(combined).map((key) => `${key}=${escape(combined[key])}`.replace('%2C', ','));

    const newHash = parts.length ? '#' + parts.join('&') : '';
    if (location.hash !== newHash) {
        programmaticHashUpdate = true;
        location.hash = newHash;
        setTimeout(() => { programmaticHashUpdate = false; }, 10);
    }
}

export function onParamsChanged(listener: (params: Record<string, string>) => void) {
    window.addEventListener('hashchange', e => {
        if (!programmaticHashUpdate) {
            listener(parseParams());
        }
    });
}

export function loadRollHistory(ds: string): any[] {
    try {
        return JSON.parse(localStorage.getItem(`rollHistory[${ds}]`) || '[]');
    } catch (ex) {
        return [];
    }
}

export function saveRollHistory(ds: string, rh: any[] | null) {
    try {
        if (rh !== null && rh.length > 0) {
            localStorage.setItem(`rollHistory[${ds}]`, JSON.stringify(rh.slice(0, historyLimit)));
        } else {
            localStorage.removeItem(`rollHistory[${ds}]`);
        }
    } catch (ex) {
        console.error(ex);
    }
}

export function transformHistory(h: any[]): Point[] {
    const map: { [key: string]: number } = {};
    h.forEach((r) => {
        map[r.value] = (map[r.value] || 0) + 1;
    });
    const total = h.length;
    const result = Object.keys(map).map((v) => ({ x: +v, y: 100 * map[v] / total }));
    return result;
}

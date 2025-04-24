export * from "./dice";
export * from "./chart";
export * from "./formatting";

const historyLimit = 1000;

export function loadRollHistory(ds: string) {
  try {
    return JSON.parse(
      localStorage.getItem(`rollHistory[${ds}]`) || "[]",
    ) as Roll[];
  } catch (ex) {
    return [];
  }
}

export function saveRollHistory(ds: string, rh: Roll[] | null) {
  try {
    if (rh !== null && rh.length > 0) {
      localStorage.setItem(
        `rollHistory[${ds}]`,
        JSON.stringify(rh.slice(0, historyLimit)),
      );
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
  const result = Object.keys(map).map((v) => ({
    x: +v,
    y: (100 * map[v]) / total,
  }));
  return result;
}

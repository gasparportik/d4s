export function scaleLinear(domain: number[], range: number[]) {
  const [ds, de] = domain;
  const [rs, re] = range;
  return function (v: number) {
    return rs + ((v - ds) / (de - ds)) * (re - rs);
  };
}

export function sparsify(array: any[], maxCount: number) {
  if (array.length <= maxCount) {
    return array;
  }
  let result = array.slice(0);
  while (result.length > maxCount) {
    result = [result[0], ...result.slice(1).filter((_, i) => i % 2 === 1)];
  }
  return result;
}

export function sparsifyStupid(array: any[], maxCount: number) {
  if (array.length <= maxCount) {
    return array;
  }
  const result = [array[0]];
  const step = (array.length - 2) / maxCount;
  let position = step;
  while (position < (array.length - step)) {
    result.push(array[Math.round(position)]);
    position += step;
  }
  result.push(array[array.length - 1]);
  return result;
}

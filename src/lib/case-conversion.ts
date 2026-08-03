const isRecord = (value: unknown): value is Record<string, unknown> =>
  Object.prototype.toString.call(value) === '[object Object]';

const camelKey = (key: string) => key.replace(/_([a-z0-9])/g, (_, character: string) => character.toUpperCase());
const snakeKey = (key: string) => key.replace(/[A-Z]/g, (character) => `_${character.toLowerCase()}`);

export const camelize = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(camelize);
  if (!isRecord(value)) return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [camelKey(key), camelize(item)]));
};

export const snakeize = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(snakeize);
  if (!isRecord(value)) return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [snakeKey(key), snakeize(item)]));
};

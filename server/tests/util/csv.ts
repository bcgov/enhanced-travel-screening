import { format, parse } from 'fast-csv';
import { flat } from 'flat';

const uniquePropsFromObjectArray = (array): any[] => {
  const set = new Set(); // Ensures members are unique
  array.forEach((object) => {
    Object.keys(object).forEach((key) => set.add(key));
  });
  return Array.from(set).sort();
};

const filterEmptyArraysAndObjects = (object) =>
  Object.keys(object)
    .filter((k) => {
      // Determine property type from objects keys and filter empty objects and arrays
      if (typeof object[k] === 'object' && object[k] != null)
        return Object.keys(object[k]).length > 0;
      if (Array.isArray(object[k])) return object[k].length > 0;
      return true; // Simple property (string, etc.)
    })
    .reduce((a, k) => ({ ...a, [k]: object[k] }), {}); // Reconstruct object from allowed keys

const toCsvString = (data) =>
  new Promise((resolve, reject) => {
    let mutated = data.map((i) => flat(i));
    mutated = mutated.map(filterEmptyArraysAndObjects);
    const headers = uniquePropsFromObjectArray(mutated);
    const chunks = [];
    const stream = format({ headers });
    stream
      .on('data', chunks.push.bind(chunks))
      .on('error', reject)
      .on('end', () => {
        const string = Buffer.concat(chunks).toString();
        resolve(string);
      });
    mutated.forEach(stream.write.bind(stream));
    stream.end();
  });

const fromCsvString = (csv): Promise<any[]> =>
  new Promise((resolve, reject) => {
    const data = [];
    const stream = parse({ headers: true })
      .on('data', data.push.bind(data))
      .on('error', reject)
      .on('end', () => resolve(data));
    stream.write(csv);
    stream.end();
  });

export { toCsvString, fromCsvString };

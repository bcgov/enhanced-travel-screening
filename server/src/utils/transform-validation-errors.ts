import { PhacEntryError } from '../types';

export const transformValidationErrors = (errors: string[]): PhacEntryError[] => {
  return errors.reduce((errors, errorMessage) => {
    const found = errorMessage.match(/^(?<id>.*):\[(?<index>\d+)\]\.(?<message>.*)$/);
    if (!found) return;

    const { index, id, message } = found.groups;
    let error = errors.find(e => e.index === index);
    if (!error) {
      error = { id, index, errors: [] };
      errors.push(error);
    }
    error.errors.push(message);

    return errors;
  }, [] as PhacEntryError[]);
};

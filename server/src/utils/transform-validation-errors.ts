import { PhacEntryError } from '../types';

export const transformValidationErrors = (errors: string[]): Record<string, PhacEntryError> => {
  return errors.reduce((errors, yupError) => {
    const found = yupError.match(/^(?<id>.*):\[(?<index>\d+)\]\.(?<message>.*)$/);
    if (!found) return;

    const { index, id, message } = found.groups;
    let error = errors[index];
    if (!error) {
      error = { id, index, errors: [] };
      errors[index] = error;
    }
    error.errors.push(message);

    return errors;
  }, {} as Record<string, PhacEntryError>);
};

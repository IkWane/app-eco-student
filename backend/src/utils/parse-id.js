import { HttpError } from './http-error.js';

export const parseId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, 'Identifiant invalide');
  }
  return id;
};
// Erreur portant un code HTTP. Un service ou un controller la lance,
// le middleware d'erreur la transforme en réponse JSON.
// Exemple : throw new HttpError(404, 'Dépense introuvable');
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
  }
}

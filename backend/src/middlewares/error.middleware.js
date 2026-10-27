// Route inconnue : renvoie un 404 au format JSON de l'API plutôt que la page HTML d'Express.
export const notFound = (req, res) => {
  res.status(404).json({ error: { message: `Route introuvable : ${req.method} ${req.originalUrl}` } });
};

// Middleware d'erreur : Express le reconnaît grâce à ses 4 paramètres, il faut donc garder `next`
// même s'il n'est pas utilisé (le _ indique au linter que c'est voulu).
// Express 5 y envoie aussi les erreurs des fonctions async.
export const errorHandler = (err, req, res, _next) => {
  // JSON mal formé dans le corps : express.json() lève une erreur de type entity.parse.failed.
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'Corps JSON invalide' } });
  }

  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 600 ? err.status : 500;

  // Erreur imprévue (bug, base injoignable…) : on la journalise côté serveur,
  // mais on ne renvoie pas son message au client (il peut contenir du SQL ou des chemins).
  if (status >= 500) {
    console.error(err);
    return res.status(status).json({ error: { message: 'Erreur interne du serveur' } });
  }

  res.status(status).json({ error: { message: err.message, details: err.details } });
};

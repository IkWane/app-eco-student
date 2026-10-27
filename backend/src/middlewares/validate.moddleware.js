import { HttpError } from '../utils/http-error.js';

const SOURCES = {
  body: { read: (req) => req.body, target: 'validatedBody' },
  query: { read: (req) => req.query, target: 'validatedQuery' },
};

const formatIssues = (issues) =>
  issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));

export const validate = (schema, source = 'body') => {
  const config = SOURCES[source];
  if (!config) {
    throw new Error(`validate : source inconnue « ${source} » (attendu : body ou query)`);
  }

  return (req, res, next) => {
    const data = config.read(req) ?? {};

    const result = schema.safeParse(data);
    if (!result.success) {
      return next(new HttpError(400, 'Données invalides', formatIssues(result.error.issues)));
    }

    req[config.target] = result.data;
    next();
  };
};
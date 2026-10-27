import app from './app.js';
import { env } from './config/env.js';

// Point d'entrée du serveur : seul fichier qui appelle listen().
app.listen(env.PORT, () => {
  console.log(`API démarrée sur http://localhost:${env.PORT}/api`);
});

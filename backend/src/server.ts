import app from './app';
import { config } from './config/config.service';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
  ################################################
  🛡️  Server listening on port: ${PORT} 🛡️
  ################################################
  `);
});

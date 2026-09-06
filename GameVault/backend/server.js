import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import app from './src/app.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

connectDB()
  .then(() => {
    const server = app.listen(PORT, '127.0.0.1', () => {
      console.log(`Express server started on port ${PORT}`);
      console.log(`Address: ${JSON.stringify(server.address())}`);
    });

    server.on('error', (error) => {
      console.error('Express server error:', error);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to database. Server not started.');
    process.exit(1);
  });

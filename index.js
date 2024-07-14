const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const knex = require('knex')(require('./knexfile').development);

const app = express();
const port = 3000;

// CORS middleware
app.use(cors({
  origin: 'http://localhost:3002', // Adjust to match your React app URL
  credentials: true
}));

app.use(express.json());

// WebSocket server setup
const wss = new WebSocket.Server({ port: 3001 });

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Dish Management API');
});

app.get('/api/dishes', async (req, res) => {
  try {
    const dishes = await knex('dishes').select('*');
    res.json(dishes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/dishes/:dishId/togglePublish', async (req, res) => {
  const { dishId } = req.params;
  try {
    const dish = await knex('dishes').where({ dishId }).first();
    if (dish) {
      await knex('dishes')
        .where({ dishId })
        .update({ isPublished: !dish.isPublished });

      // Broadcast the update to all connected WebSocket clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ dishId, isPublished: !dish.isPublished }));
        }
      });

      res.json({ message: 'Dish status updated successfully' });
    } else {
      res.status(404).json({ error: 'Dish not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

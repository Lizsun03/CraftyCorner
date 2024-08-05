// import express from "express";
// import http from "http";
// import { WebSocketServer } from "ws";

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
// const server = http.createServer(app);
// const wsServer = new WebSocketServer({ server });

const PORT = 3000;
// const cors = require('cors');
// app.use(cors());

// initialize items array
let items = []

const dbPath = path.join(__dirname, '/public/database.json');

// Function to read database
const readDatabase = () => {
    const data = fs.readFileSync(dbPath);
    return JSON.parse(data);
};

// Function to write to database
const writeDatabase = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

app.get('/database.json', (req, res) => {
    res.sendFile(dbPath);
});

// Middleware to parse JSON bodies
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));


// Endpoint to get main page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Endpoint to get items
app.get('/items', (req, res) => {
  // Read the database.json file
  const filePath = path.join(__dirname, '/public/database.json');
  const database = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Send the items as a JSON response
  res.json(database);
});

// Endpoint to get item details
app.get('/item/:id', (req, res) => {
  // Read the database.json file
  const filePath = path.join(__dirname, '/public/database.json');
  const database = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Get the item with the specified ID
  const item = database[req.params.id];

  // Send the item as a JSON response
  res.json(item);
});

// Endpoint to update item details
app.put('/item/:id', (req, res) => {
  // Read the current database.json file
  const filePath = path.join(__dirname, '/public/database.json');
  const database = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Get the item with the specified ID
  const item = database[req.params.id];

  // Update the item with the new details
  item.Name = req.body.name;
  item.Description = req.body.description;
  item.EcoFriendly = req.body.ecoFriendly === 'yes';
  item.Barter = req.body.barter === 'yes';
  item.Labels.price = req.body.price;
  item.Labels.material = req.body.material;
  item.Labels.Color = req.body.color;
  item.Labels.Quantity = req.body.quantity;
  item.Labels.Condition = req.body.condition;
  item.ImageURL = req.body.imageUrl;

  // Write the updated database back to the file
  fs.writeFileSync(filePath, JSON.stringify(database, null, 2));

  // Send a success response
  res.status(200).json({ message: 'Item updated successfully' });
});

// Endpoint to add an item to the database
app.post('/add-item', (req, res) => {
    try {
        const newItem = req.body;

        // labels
        // const labels = {
        //     Price: newItem.price,
        //     Material: newItem.material,
        //     Color: newItem.color,
        //     Quantity: newItem.quantity,
        //     Condition: newItem.condition
        // };

        
        // Prepare new item format
        // const formattedItem = {
        //     Name: newItem.name || '',
        //     Description: newItem.description || '',
        //     EcoFriendly: newItem.ecoFriendly === 'yes',
        //     Barter: newItem.barter === 'yes',
        //     Labels: labels,
        //     ImageURL: newItem.imageUrl || '',
        //     favorite: false
        // };

        // console.log("formatted Item:" + formattedItem)
        
        const db = readDatabase();
        
        // Generate a new ID
        const newId = (Object.keys(db).length + 1).toString();
        
        // Add the new item to the database
        db[newId] = newItem;
        
        // Write the updated database to file
        writeDatabase(db);
        
        res.status(200).json({ message: 'Item added successfully' });
        } catch (error) {
        res.status(500).json({ error: 'Failed to add item' });
    }
});

// Endpoint to delete an item from the database
app.delete('/delete-item/:id', (req, res) => {
    try {
        const db = readDatabase();
        
        // Check if the item exists
        if (!db[req.params.id]) {
            return res.status(404).json({ error: 'Item not found' });
        }
        
        // Delete the item
        delete db[req.params.id];
        
        // Write the updated database to file
        writeDatabase(db);
        
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

// Endpoint to toggle favorite status of an item
app.put('/toggle-favorite/:id', (req, res) => {
    try {
        const db = readDatabase();
        
        // Check if the item exists
        if (!db[req.params.id]) {
            return res.status(404).json({ error: 'Item not found' });
        }
        
        // Toggle the favorite status
        db[req.params.id].favorite = !db[req.params.id].favorite;
        
        // Write the updated database to file
        writeDatabase(db);
        
        res.status(200).json({ message: 'Favorite status updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update favorite status' });
    }
});

// Endpoint to search for items
app.get('/search', (req, res) => {
    try {
        const db = readDatabase();
        
        // Get the search query from the request
        const query = req.query.q.toLowerCase();
        
        // Filter the items based on the search query
        const searchResults = Object.values(db).filter((item) => {
            return item.Name.toLowerCase().includes(query) || item.Description.toLowerCase().includes(query);
        });
        
        res.status(200).json(searchResults);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search for items' });
    }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

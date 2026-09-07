const express = require('express');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('DocuMind funcionando');
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
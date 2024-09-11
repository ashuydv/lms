require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const certificateRoutes = require('./routes/certificateRoutes');


const app = express();

connectDB();

app.use(cors({
    origin: 'http://127.0.0.1:5500',
    methods: ['POST', 'GET'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '50mb' }));

app.use('/api/certificates', certificateRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
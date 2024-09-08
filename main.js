const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();

// Enable CORS for all routes
app.use(cors({
    origin: 'http://127.0.0.1:5500', // Replace with your frontend origin
    methods: ['POST'],
    allowedHeaders: ['Content-Type']
}));

// Middleware to parse JSON bodies
app.use(express.json({ limit: '50mb' }));

app.post('/save-certificate', async (req, res) => {
    console.log("Certificate saving request received");

    const { uniqueId, name, pdfData } = req.body;

    // Validate input
    if (!uniqueId || !name || !pdfData) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const filename = `${uniqueId}_${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_certificate.pdf`;
    const filePath = path.join(__dirname, 'certificates', filename);

    try {
        // Remove the data URL prefix to get just the base64 data
        const base64Data = pdfData.replace(/^data:application\/pdf;base64,/, "");

        // Ensure the certificates directory exists
        await fs.mkdir(path.join(__dirname, 'certificates'), { recursive: true });

        // Write the file
        await fs.writeFile(filePath, base64Data, 'base64');

        console.log(`Certificate saved successfully: ${filename}`);
        res.json({ success: true, message: 'Certificate saved successfully', filename });
    } catch (error) {
        console.error('Error saving certificate:', error);
        res.status(500).json({ success: false, message: 'Failed to save certificate' });
    }
});

app.get('/list-certificates', async (req, res) => {
    const certificatesDir = path.join(__dirname, 'certificates');
    try {
        const files = await fs.readdir(certificatesDir);
        const certificates = files
            .filter(file => file.endsWith('_certificate.pdf'))
            .map(file => {
                return { fullName: file };  // Return the full file name
            });
        res.json(certificates);
    } catch (error) {
        console.error('Error listing certificates:', error);
        res.status(500).json({ error: 'Failed to list certificates' });
    }
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
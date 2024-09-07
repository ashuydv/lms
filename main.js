const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = 5500;

const cors = require('cors');
app.use(cors());

// Middleware
app.use(express.static('assets'));
app.use(express.json({ limit: '50mb' })); // Add this line to parse JSON bodies

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
    console.log("hello world", res);
});

app.post('/save-certificate', async (req, res) => {
    const { uniqueId, name, pdfData } = req.body;
    const filename = `${uniqueId}_${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_certificate.pdf`;
    const filePath = path.join(__dirname, 'certificates', filename);

    try {
        // Remove the data URL prefix to get just the base64 data
        const base64Data = pdfData.replace(/^data:application\/pdf;base64,/, "");

        // Ensure the certificates directory exists
        await fs.mkdir(path.join(__dirname, 'certificates'), { recursive: true });

        // Write the file
        await fs.writeFile(filePath, base64Data, 'base64');

        res.json({ success: true, message: 'Certificate saved successfully' }); // Always return valid JSON
    } catch (error) {
        console.error('Error saving certificate:', error);
        res.status(500).json({ success: false, message: 'Failed to save certificate' }); // Return valid JSON on error
    }
});


app.get('/certificate/:uniqueId', async (req, res) => {
    const uniqueId = req.params.uniqueId;
    const certificatesDir = path.join(__dirname, 'certificates');

    try {
        const files = await fs.readdir(certificatesDir);
        const certificateFile = files.find(file => file.startsWith(uniqueId));

        if (certificateFile) {
            res.sendFile(path.join(certificatesDir, certificateFile));
        } else {
            res.status(404).send('Certificate not found');
        }
    } catch (error) {
        console.error('Error serving certificate:', error);
        res.status(500).send('Error retrieving certificate');
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
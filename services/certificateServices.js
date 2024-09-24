const Certificate = require('../models/Certificate');
const fs = require('fs').promises;
const path = require('path');

// Helper function to get the correct certificates directory
const getCertificatesDir = () => {
    return path.join(__dirname, '..', 'certificates');
};

exports.helloWorld = async (req, res) => {
    res.send('Hello World!');
};

exports.saveCertificate = async (req, res) => {
    console.log("Certificate saving request received");
    const { uniqueId, name, pdfData } = req.body;

    // Validate input
    if (!uniqueId || !name || !pdfData) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const filename = `${uniqueId}_${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_certificate.pdf`;
    const filePath = path.join(getCertificatesDir(), filename);

    try {
        // Remove the data URL prefix to get just the base64 data
        const base64Data = pdfData.replace(/^data:application\/pdf;base64,/, "");

        // Ensure the certificates directory exists
        await fs.mkdir(getCertificatesDir(), { recursive: true });

        // Write the file
        await fs.writeFile(filePath, base64Data, 'base64');

        // Save certificate info to MongoDB
        const certificate = new Certificate({
            uniqueId,
            name,
            filename
        });
        await certificate.save();

        console.log(`Certificate saved successfully: ${filename}`);
        res.json({ success: true, message: 'Certificate saved successfully', filename });
    } catch (error) {
        console.log('Error saving certificate:', error);
        res.status(500).json({ success: false, message: 'Failed to save certificate' });
    }
};

exports.listCertificates = async (req, res) => {
    const certificatesDir = getCertificatesDir();
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
};
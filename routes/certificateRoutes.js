const express = require('express');
const router = express.Router();
const certificateService = require('../services/certificateServices');

router.post('/save-certificate', certificateService.saveCertificate);
router.get('/list-certificates', certificateService.listCertificates);
router.get('/hello-world', certificateService.helloWorld);

module.exports = router;
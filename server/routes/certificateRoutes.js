const express = require('express');
const router = express.Router();
const {
  getCertificate,
  downloadCertificatePdf,
  verifyCertificate
} = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');

router.get('/verify/:certId', verifyCertificate);
router.get('/:courseId', protect, getCertificate);
router.get('/:courseId/download', protect, downloadCertificatePdf);

module.exports = router;

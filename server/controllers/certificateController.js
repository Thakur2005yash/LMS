const PDFDocument = require('pdfkit');
const db = require('../models/db');
const crypto = require('crypto');

// Generate unique certificate ID
const generateCertificateId = () => {
  const code = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `LMS-CERT-${code}`;
};

// @desc    Get or generate certificate record for completed course
// @route   GET /api/certificates/:courseId
// @access  Private
exports.getCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const course = db.Courses.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const enrollment = db.Enrollments.findOne({ courseId, userId });
    if (!enrollment) {
      return res.status(403).json({ success: false, message: 'You are not enrolled in this course.' });
    }

    // Check completion requirements (progress must be 100%)
    if (enrollment.progress < 100) {
      return res.status(400).json({
        success: false,
        message: `Course is ${enrollment.progress}% complete. Finish all lessons to unlock your certificate.`
      });
    }

    // Check if certificate already issued
    let cert = db.Certificates.findOne({ courseId, userId });

    if (!cert) {
      const certId = generateCertificateId();
      const issueDate = new Date().toISOString();

      cert = db.Certificates.create({
        certificateId: certId,
        userId,
        userName: req.user.name,
        userEmail: req.user.email,
        courseId,
        courseTitle: course.title,
        instructorName: course.instructorName || 'Platform Instructor',
        category: course.category || 'Professional Track',
        issueDate,
        grade: 'Excellence (100%)',
        verifyUrl: `/verify-certificate/${certId}`
      });

      // Update enrollment with certificate ID
      db.Enrollments.findByIdAndUpdate(enrollment._id, {
        certificateId: certId,
        isCompleted: true
      });

      // Award Certificate Master Badge
      const user = db.Users.findById(userId);
      const badges = user.badges || [];
      if (!badges.includes('Certified Scholar')) badges.push('Certified Scholar');
      db.Users.findByIdAndUpdate(userId, { badges });
    }

    res.status(200).json({
      success: true,
      certificate: cert
    });
  } catch (err) {
    console.error('getCertificate error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving certificate.' });
  }
};

// @desc    Download official verifiable PDF certificate
// @route   GET /api/certificates/:courseId/download
// @access  Private
exports.downloadCertificatePdf = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const cert = db.Certificates.findOne({ courseId, userId });
    if (!cert) {
      return res.status(404).json({
        success: false,
        message: 'No issued certificate found. Please complete the course first.'
      });
    }

    const course = db.Courses.findById(courseId);

    // Create A4 Landscape PDF
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margin: 30
    });

    const filename = `Certificate-${cert.certificateId}.pdf`;
    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // Background styling
    const pageWidth = 841.89; // A4 landscape width in points
    const pageHeight = 595.28; // A4 landscape height in points

    // Outer decorative border (Deep Navy / Charcoal)
    doc.rect(20, 20, pageWidth - 40, pageHeight - 40)
      .lineWidth(3)
      .strokeColor('#0f172a')
      .stroke();

    // Inner gold border
    doc.rect(28, 28, pageWidth - 56, pageHeight - 56)
      .lineWidth(1.5)
      .strokeColor('#d97706')
      .stroke();

    // Header Accents
    doc.fillColor('#6366f1')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('LEARNHUB ONLINE ACADEMY', 0, 65, { align: 'center', characterSpacing: 3 });

    doc.fillColor('#0f172a')
      .fontSize(32)
      .font('Helvetica-Bold')
      .text('CERTIFICATE OF COMPLETION', 0, 95, { align: 'center', characterSpacing: 1 });

    doc.moveDown(0.4);
    doc.fillColor('#64748b')
      .fontSize(13)
      .font('Helvetica')
      .text('THIS IS PROUDLY PRESENTED TO', { align: 'center', characterSpacing: 2 });

    // Student Name
    doc.moveDown(0.7);
    doc.fillColor('#1e293b')
      .fontSize(30)
      .font('Helvetica-Bold')
      .text(cert.userName.toUpperCase(), { align: 'center' });

    // Decorative line under name
    const lineY = doc.y + 4;
    doc.moveTo(220, lineY)
      .lineTo(pageWidth - 220, lineY)
      .lineWidth(2)
      .strokeColor('#e2e8f0')
      .stroke();

    doc.y = lineY + 14;

    doc.fillColor('#475569')
      .fontSize(12)
      .font('Helvetica')
      .text('for successfully completing all curriculum requirements, practical exercises, and quizzes in:', { align: 'center' });

    // Course Title
    doc.moveDown(0.5);
    doc.fillColor('#0f172a')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text(`"${cert.courseTitle}"`, { align: 'center' });

    // Details banner
    doc.moveDown(1.5);
    const dateFormatted = new Date(cert.issueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const bottomY = pageHeight - 140;

    // Left Signature
    doc.moveTo(80, bottomY + 30).lineTo(260, bottomY + 30).lineWidth(1).strokeColor('#94a3b8').stroke();
    doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text(cert.instructorName, 80, bottomY + 35, { width: 180, align: 'center' });
    doc.fillColor('#64748b').fontSize(10).font('Helvetica').text('Course Lead Instructor', 80, bottomY + 50, { width: 180, align: 'center' });

    // Center Gold Seal & ID
    doc.circle(pageWidth / 2, bottomY + 20, 28).lineWidth(2).strokeColor('#d97706').fillAndStroke('#fef3c7', '#d97706');
    doc.fillColor('#b45309').fontSize(11).font('Helvetica-Bold').text('VERIFIED', pageWidth / 2 - 35, bottomY + 15, { width: 70, align: 'center' });
    doc.fillColor('#64748b').fontSize(9).font('Helvetica').text(`ID: ${cert.certificateId}`, 0, bottomY + 60, { align: 'center' });

    // Right Signature & Date
    doc.moveTo(pageWidth - 260, bottomY + 30).lineTo(pageWidth - 80, bottomY + 30).lineWidth(1).strokeColor('#94a3b8').stroke();
    doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text(dateFormatted, pageWidth - 260, bottomY + 35, { width: 180, align: 'center' });
    doc.fillColor('#64748b').fontSize(10).font('Helvetica').text('Date of Conferment', pageWidth - 260, bottomY + 50, { width: 180, align: 'center' });

    // Footer verification link
    doc.fillColor('#94a3b8').fontSize(8).font('Helvetica')
      .text(`Verify online authenticity at: https://learnhub.io/verify/${cert.certificateId}`, 0, pageHeight - 45, { align: 'center' });

    doc.end();
  } catch (err) {
    console.error('downloadCertificatePdf error:', err);
    res.status(500).json({ success: false, message: 'Server error generating certificate PDF.' });
  }
};

// @desc    Public verification endpoint for certificate ID
// @route   GET /api/certificates/verify/:certId
// @access  Public
exports.verifyCertificate = async (req, res) => {
  try {
    const { certId } = req.params;
    const cert = db.Certificates.findOne({ certificateId: certId });

    if (!cert) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Certificate ID not found in official registry.'
      });
    }

    res.status(200).json({
      success: true,
      valid: true,
      certificate: {
        certificateId: cert.certificateId,
        studentName: cert.userName,
        courseTitle: cert.courseTitle,
        instructorName: cert.instructorName,
        issueDate: cert.issueDate,
        grade: cert.grade,
        category: cert.category
      }
    });
  } catch (err) {
    console.error('verifyCertificate error:', err);
    res.status(500).json({ success: false, message: 'Server error verifying certificate.' });
  }
};

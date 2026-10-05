import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Resource } from '../models/Resource.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../uploads');

// @desc    Get resources with search & subject/semester filtering + pagination
// @route   GET /api/resources
// @access  Public
export const getResources = async (req, res, next) => {
  try {
    const { subject, semester, category, search, page = 1, limit = 10 } = req.query;

    const query = {};

    if (subject && subject !== 'All') {
      query.subject = subject;
    }

    if (semester && semester !== 'All') {
      query.semester = Number(semester);
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { subject: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const totalResources = await Resource.countDocuments(query);
    const resources = await Resource.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('uploadedBy', 'name email')
      .lean();

    res.status(200).json({
      success: true,
      count: resources.length,
      total: totalResources,
      totalPages: Math.ceil(totalResources / limitNum) || 1,
      currentPage: pageNum,
      resources
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload a new resource (Notes / Previous Year Papers / etc.)
// @route   POST /api/resources
// @access  Private (Admin only)
export const uploadResource = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please attach a PDF or DOCX file.'
      });
    }

    const { title, description, subject, semester, category } = req.body;

    const resource = await Resource.create({
      title,
      description: description || '',
      subject,
      semester: Number(semester) || 1,
      category: category || 'Notes',
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      uploadedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Resource uploaded successfully.',
      resource
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download a resource file
// @route   GET /api/resources/:id/download
// @access  Public
export const downloadResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found.'
      });
    }

    // Increment download counter
    resource.downloads += 1;
    await resource.save();

    // Determine physical path
    const filename = path.basename(resource.fileUrl);
    const filePath = path.join(uploadsDir, filename);

    if (fs.existsSync(filePath)) {
      return res.download(filePath, resource.fileName);
    } else {
      // If sample seeded file or missing physical file, serve dynamic placeholder buffer
      res.setHeader('Content-Disposition', `attachment; filename="${resource.fileName}"`);
      res.setHeader('Content-Type', resource.fileType || 'application/pdf');
      const placeholderContent = `CampusConnect Resource Document\n================================\nTitle: ${resource.title}\nSubject: ${resource.subject}\nSemester: ${resource.semester}\nCategory: ${resource.category}\nUploaded By: CampusConnect Academic Portal\n\n[Verified Academic Content for Student Reference]`;
      return res.send(Buffer.from(placeholderContent, 'utf-8'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private (Admin only)
export const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found.'
      });
    }

    // Try to remove physical file
    try {
      const filename = path.basename(resource.fileUrl);
      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.warn(`Could not delete file from disk: ${e.message}`);
    }

    await resource.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get filter metadata (distinct subjects and semesters)
// @route   GET /api/resources/meta
// @access  Public
export const getResourceMeta = async (req, res, next) => {
  try {
    const subjects = await Resource.distinct('subject');
    const semesters = await Resource.distinct('semester');
    const categories = ['Notes', 'Previous Year Paper', 'Lab Manual', 'Reference Book', 'Syllabus'];

    res.status(200).json({
      success: true,
      subjects: subjects.sort(),
      semesters: semesters.sort((a, b) => a - b),
      categories
    });
  } catch (error) {
    next(error);
  }
};

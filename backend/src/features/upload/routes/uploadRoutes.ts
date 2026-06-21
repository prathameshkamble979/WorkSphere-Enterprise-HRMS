import express, { Request, Response } from 'express';
import { protect, authorize } from '../../../middlewares/authMiddleware';
import { upload } from '../../../middlewares/uploadMiddleware';

const router = express.Router();

router.post('/', protect, authorize('Admin', 'HR', 'Employee', 'Manager'), upload.single('file'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'No file uploaded' } });
    }

    // Return the URL to access the uploaded file
    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      data: {
        url: fileUrl,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'File upload failed' } });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import Setting from '../models/Setting';

const router = Router();

// GET platform settings (weights and risk thresholds)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const settings = await Setting.findOne({ key: 'global_settings' }).lean();
    if (!settings) {
      return res.json({
        success: true,
        data: null,
      });
    }
    return res.json({
      success: true,
      data: {
        weights: settings.weights,
        academicThresholds: settings.academicThresholds,
        placementThresholds: settings.placementThresholds,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve settings',
      error: error.message,
    });
  }
});

// POST save platform settings
router.post('/', async (req: Request, res: Response) => {
  try {
    const { weights, academicThresholds, placementThresholds } = req.body;

    const updated = await Setting.findOneAndUpdate(
      { key: 'global_settings' },
      {
        $set: {
          ...(weights && { weights }),
          ...(academicThresholds && { academicThresholds }),
          ...(placementThresholds && { placementThresholds }),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({
      success: true,
      message: 'Settings saved to MongoDB',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to save settings',
      error: error.message,
    });
  }
});

export default router;

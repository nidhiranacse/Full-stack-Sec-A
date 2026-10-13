const express = require('express');
const router = express.Router();

router.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalStudentsEnrolled: 1420,
      activeEvents: 18,
      sharedStudyResources: 245,
      studentDetails: {
        name: 'Pulkit Goyal',
        cuid: 'CU24250263',
        roll: 40,
        section: 'A'
      }
    }
  });
});

module.exports = router;

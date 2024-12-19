const express = require('express');
const { registerUser, loginUser, getUser, logoutUser, getCampaigns, donatePage, getCampId, getDoner, contacts, payment, shareCampaign } = require('../Controller/AuthController');
const authMiddleware = require('../Middleware/AuthMiddleware');
const router = express.Router();
const multer = require('multer');
const Campaign = require('../CampaignModel/CampaignModels');
const User = require('../CampaignModel/UserModel');



router.post('/signup', registerUser);


router.post('/login', loginUser);


router.get('/profile', authMiddleware, getUser);


router.post('/logout', logoutUser);



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname); 
    }
  });
  
  const upload = multer({ storage: storage });
  
  router.post('/campaigns',authMiddleware, upload.fields([{ name: 'media' }, { name: 'media1' }]), async (req, res) => {
    console.log('Incoming Request Data:', req.body); 
    console.log('Files:', req.files); 

    const userId = req.userId;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized. User ID not found.' });
    }

    const user = await User.findById(userId);
    console.log('User ID:', userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    if (!user.emailVerified || user.emailDomain !== 'knit.ac.in') {
        return res.status(403).json({ message: 'You are not authorized to create a campaign. Please verify your email as @knit.ac.in first.' });
    }

    try {
        const { title, description, category, goal, deadline } = req.body;

        const newCampaign = new Campaign({
            title,
            description,
            category,
            media: req.files['media'][0].path,
            goal,
            deadline,
            media1: req.files['media1'][0].path,
            createdBy: userId  
        });

        const data=await newCampaign.save();
        res.status(201).json({ message: 'Campaign created successfully', campaign: data });
    } catch (error) {
        res.status(500).json({ message: 'Error creating campaign', error });
    }
});


router.get('/getCampaign',getCampaigns);

router.post('/campaign/:id/donate', donatePage); 


router.get('/getCampaign/:id', getCampId);

router.get('/doner/:id', getDoner);

router.post('/contact', contacts);
  
router.post('/create-payment-intent', payment);


router.get('/search', (req, res) => {
    const query = req.query.query?.toLowerCase() || '';
    if (!query) {
      return res.status(400).json({ results: [] });
    }
  
    const filteredCampaigns = campaigns.filter(campaign =>
      campaign.title.toLowerCase().includes(query) ||
      campaign.description.toLowerCase().includes(query)
    );
  
    res.json({ results: filteredCampaigns });
  });

  router.get('/campaign/:id/share', shareCampaign);

module.exports = router;

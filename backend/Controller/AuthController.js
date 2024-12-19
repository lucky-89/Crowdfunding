const User = require('../CampaignModel/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Campaign=require('../CampaignModel/CampaignModels');
const Donation = require('../CampaignModel/DonationModel');
const nodemailer = require('nodemailer');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET); 


exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    
    try {

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

       
        const emailDomain = email.split('@')[1];


        const hashedPassword = await bcrypt.hash(password, 10);

    
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            emailDomain, 
            emailVerified: emailDomain === 'knit.ac.in', 
        });

   
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

   
        res.status(201).json({ token, user });
    } catch (error) {
        res.status(500).json({ message: 'Error creating account', error: error.message });
    }
};









exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCampaigns= async(req,res)=>{
    try{
        const camp=await Campaign.find();
        res.status(200).json(camp);
    }
    catch(error){
        res.status(500).json({ message: 'Error fetching campaigns', error });
    }
}
exports.logoutUser = (req, res) => {
    res.status(200).json({ message: 'User logged out successfully' });
};

exports.donatePage = async (req, res) => {
  const { id } = req.params;
  const { amount, name, email, phone } = req.body;

  try {
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    campaign.amountRaised += Number(amount);
    await campaign.save();

    const newDonation = new Donation({
      name,
      email,
      phone,
      amount: Number(amount),
      campaign: id,
    });

    await newDonation.save();

    res.status(200).json({ message: 'Donation successful', campaign });
  } catch (error) {
    console.error('Error processing donation:', error);
    res.status(500).json({ message: 'Error processing donation' });
  }
};

exports.getCampId=async (req, res) => {
    const { id } = req.params;
  
    try {
    
      const campaign = await Campaign.findById(id);
      
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }
  
      res.status(200).json(campaign);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      res.status(500).json({ message: 'Error fetching campaign', error });
    }
  }


  exports.getDoner= async(req,res)=>{
    const {id}= req.params;

    try{
      const doner=await Donation.find({ campaign: id });

      if(!doner || doner.length === 0){
        return res.status(404).json({ message: 'Doner not found' });
      }
      res.status(200).json(doner);
    }
    catch(error){
      console.error('Error fetching doner:', error);
      res.status(500).json({ message: 'Error fetching doner', error });
    }
  }


  exports.logoutUser = (req, res) => {
    res.status(200).json({ message: 'User logged out successfully' });
};

exports.contacts = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'luckymaurya9719@gmail.com', 
        pass: 'vzbp gajb acbo lglq',
      },
    });

    const mailOptions = {
      from: email,
      to: 'luckymaurya9719@gmail.com',   
      subject: `New contact form submission from ${name}: ${subject}`,
      text: `You have received a new message from ${name} (${email}):\n\n${message}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

exports.payment = async (req, res) => {
  const { amount, name, email, address } = req.body;

  try {
    console.log('Creating payment intent with:', { amount, name, email, address }); // Debugging line
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, 
      currency: 'inr', 
      receipt_email: email,
      description: `Donation to ${name}'s campaign`,
      payment_method_types: ['card'],
      shipping: {
        name: name,
        address: {
          line1: address.line1,
          city: address.city,
          postal_code: address.postal_code,
          country: address.country,
        },
      },
    });

    console.log('Payment intent created:', paymentIntent); 
    res.send({ clientSecret: paymentIntent.client_secret });

  } catch (error) {
    console.error('Error creating payment intent:', error); 
    res.status(500).json({ message: 'Failed to create payment intent', error: error.message });
  }
};



exports.shareCampaign = async (req, res) => {
  const { id } = req.params;

  try {
      const campaign = await Campaign.findById(id);
      if (!campaign) {
          return res.status(404).json({ message: 'Campaign not found' });
      }

      const campaignUrl = `${process.env.BASE_URL}/campaign/${campaign._id}`;
      res.status(200).json({ message: 'Campaign URL generated', url: campaignUrl });
  } catch (error) {
      res.status(500).json({ message: 'Error generating shareable URL', error });
  }
};


import express from 'express'; 
const router = express.Router();
import User from '../models/User.js';

// POST /api/match
router.post("/", async (req, res ) => {
    const {userId} = req.body;

    try {
        const currentUser = await User.findById(userId);
        if (!currentUser) return res.status(404).json({ message: "User not found" });

        // Find users where their teaching skills match currentUser's learning skills
        // and their learning skills match currentUser's teaching skills
        const matches = await User.find({
            _id: { $ne: userId }, // Exclude current user
            user_skillsToTeach: { $in: currentUser.user_skillsToLearn},
            user_skillsToLearn: { $in: currentUser.user_skillsToTeach},
        });

        res.json(matches);

    }catch (err) {
        res.status(500).json({message: err.message});
    }
});

export default router;
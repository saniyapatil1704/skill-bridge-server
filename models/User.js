import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  user_name: { type: String, required: true },
  user_email: { type: String, required: true, unique: true },
  user_password: { type: String, required: true },
  user_skillsToTeach: [String],
  user_skillsToLearn: [String],
  user_role: {
    type: String,
    enum: ["mentor", "learner", "both"],
    default: "both",
  },
  rating: { type: Number, default: 0 },
});

const User = mongoose.model("User", userSchema);
export default User; // ✅ default export

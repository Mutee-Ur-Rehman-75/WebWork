import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: {type: String, required: true, unique: true, index: true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ["admin", "farmer"],
    default: "farmer",
  },
  
}, {timestamps:true});

export default mongoose.model("User", userSchema);
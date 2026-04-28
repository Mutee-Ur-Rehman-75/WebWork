// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const register = async (req, res) => {
    try {
        const { name, username, email, password, role } = req.body;
        
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({ name, username, email, role, password: hashedPassword });

        const token = jwt.sign(
            { id: user._id, email: user.email, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
        );

        res.
            cookie('jwt-token', token, {
                maxAge: 86400000,  // for one day (in milliseconds)
                httpOnly: true,
                secure: true,
                sameSite: 'lax'
            }).
            status(201).json({
                message: "User registered successfully",
                token,
                role: user.role,
                user: { id: user._id, name: user.name, email: user.email },
            });
    } catch (error) {
        res.status(500).json({ message: "Registration failed", error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const user = await User.findOne({ $or: [{ username }, { email }] });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, email: user.email, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
        );

        res.
            cookie('jwt-token', token, {
                maxAge: 86400000,  // for one day (in milliseconds)
                httpOnly: true,
                secure: true,
                sameSite: 'lax'
            }).
            status(200).json({
                message: "Login successful",
                token,
                role: user.role,
                user: { id: user._id, name: user.name, email: user.email, },
            });
    } catch (error) {
        res.status(500).json({ message: "Login failed", error: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('jwt-token');
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ message: "Logout failed", error: error.message });
    }
}
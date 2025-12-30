import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import Delivery from "../models/deliveryModel.js";
import Seller from "../models/Seller.js";
import generateToken from "../utils/generateToken.js";
import nodemailer from "nodemailer";
import { comprehensiveLoginValidation } from "../utils/loginValidation.js";

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Use comprehensive validation
    const validationResult = comprehensiveLoginValidation({ email, password });
    
    if (!validationResult.isValid) {
      return res.status(400).json({ 
        message: validationResult.error,
        field: validationResult.field,
        timestamp: validationResult.timestamp
      });
    }

    // Use sanitized data
    const { email: sanitizedEmail, password: sanitizedPassword } = validationResult.sanitizedData;

    // Try delivery agent login first
    const delivery = await Delivery.findOne({ email: sanitizedEmail });
    if (delivery && await delivery.matchPassword(sanitizedPassword)) {
      const token = generateToken(delivery._id, "delivery");
      return res.json({
        token,
        user: {
          id: delivery._id,
          name: delivery.name,
          email: delivery.email,
          role: "deliveryAgent"
        }
      });
    }

    // Try regular user login
    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      return res.status(401).json({ 
        message: "Invalid email or password",
        timestamp: validationResult.timestamp
      });
    }

    const isPasswordValid = await bcrypt.compare(sanitizedPassword, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: "Invalid email or password",
        timestamp: validationResult.timestamp
      });
    }

    const token = generateToken(user);
    
    // Get seller data if user is a seller
    let userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    if (user.role === "seller") {
      try {
        const sellerRecord = await Seller.findOne({ email: user.email });
        if (sellerRecord) {
          userData = {
            ...userData,
            restaurantName: sellerRecord.restaurantName,
            station: sellerRecord.station,
            isActive: sellerRecord.isActive,
            isApproved: sellerRecord.isApproved
          };
        }
      } catch (error) {
        console.error('Error fetching seller data:', error);
      }
    }

    res.json({
      token,
      user: userData
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// REGISTER
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      restaurantName,
      station
    } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (name.length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Delivery Agent
    if (role === "deliveryAgent") {
      const exists = await Delivery.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: "Email already registered as delivery agent" });
      }

      const delivery = await Delivery.create({
        name,
        email,
        password,
        phone: "+94770000000",
        isAvailable: false
      });

      const token = generateToken(delivery._id, "delivery");

      return res.status(201).json({
        message: "Delivery agent registered successfully",
        token,
        user: {
          id: delivery._id,
          name: delivery.name,
          email: delivery.email,
          role: "deliveryAgent"
        }
      });
    }

    // Normal User
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || "customer"
    });

    // Seller creation
    if (role === "seller") {
      if (!restaurantName || !station) {
        return res.status(400).json({
          message: "Restaurant name and station are required for sellers"
        });
      }

      await Seller.create({
        name,
        email,
        password,
        restaurantName,
        station,
        isApproved: false
      });
    }

    const token = generateToken(user);

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// FORGOT PASSWORD (Send OTP)
export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is: ${otp}. Valid for 10 minutes.`,
    });

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Forget password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.resetOtp !== otp || user.otpExpire < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetOtp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// VERIFY TOKEN
export const verifyToken = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Token verification failed" });
  }
};

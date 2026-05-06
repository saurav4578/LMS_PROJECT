const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'faculty', 'admin'], default: 'student' },
  isApproved: { type: Boolean, default: false }, // Faculty need approval from admin
  teacherCode: { type: String, unique: true, sparse: true }, // For faculty: unique code for their tenant
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For students: ref to their teacher
  profilePicture: { type: String, default: '' },
  phoneNumber: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: [{ type: String }], // For faculty
  interests: [{ type: String }], // For students
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  isVerified: { type: Boolean, default: false },
  otpCode: { type: String },
  otpExpiry: { type: Date },
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

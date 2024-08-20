/* eslint-disable import/no-extraneous-dependencies */
const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { isEmail } = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A User must have a name'],
      trim: true
    },

    email: {
      type: String,
      required: [true, 'A User must have an email'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: isEmail,
        message: 'Please provide a valid email'
      }
    },

    photo: {
      type: String,
      default: '/img/users/default.jpg'
    },

    role: {
      type: String,
      enum: {
        values: ['user', 'guide', 'lead-guide', 'admin'],
        message: 'Role must be either: user, guide, lead-guide, or admin'
      },
      default: 'user'
    },

    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must have at least 8 characters'],
      select: false
    },

    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function(value) {
          // this only works on CREATE and SAVE
          return value === this.password;
        },
        message: 'Passwords are not the same'
      },
      select: false
    },

    passwordChangedAt: {
      type: Date
    },

    passwordResetToken: {
      type: String,
      select: false
    },

    passwordResetExpires: {
      type: Date,
      select: false
    },

    active: {
      type: Boolean,
      default: true,
      select: false
    }
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

userSchema.pre('save', async function(next) {
  // Only run this function if the password field is modified or the document is new
  if (!this.isModified('password')) return next();

  // Hash the password with a salt round of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Discard the passwordConfirm field
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });

  next();
});

userSchema.methods.isPasswordCorrect = async function(
  inputPassword,
  storedPassword
) {
  return await bcrypt.compare(inputPassword, storedPassword);
};

userSchema.methods.isPassChangedSinceJWT = function(JWTIssuedAt) {
  // checking if the user has ever changed the password
  if (this.passwordChangedAt) {
    const formattedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTIssuedAt < formattedTimeStamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  // Generate a random token of 32 characters
  const resetToken = crypto.randomBytes(16).toString('hex');

  // Hash the token and to store it in the database
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set the password reset token expiration time to 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

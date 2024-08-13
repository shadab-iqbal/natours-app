const mongoose = require('mongoose');
const { isEmail, isStrongPassword } = require('validator');

const strongPasswordOptions = {
  minLength: 8,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1
};

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
      validate: {
        validator: isEmail,
        message: 'Please provide a valid email'
      }
    },

    photo: {
      type: String,
      default: '/img/users/default.jpg'
    },

    password: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function(value) {
          return isStrongPassword(value, strongPasswordOptions);
        },
        message:
          'Password must be stronger. It should be at least 8 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol.'
      },
      select: false
    },

    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function(value) {
          return value === this.password;
        },
        message: 'Passwords are not the same'
      },
      select: false
    }
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;

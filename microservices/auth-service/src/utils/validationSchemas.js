const Joi = require('joi');

const authSchemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).max(128).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'any.required': 'Password is required'
    }),
    role: Joi.string().valid('buyer', 'farmer', 'admin').default('buyer').messages({
      'any.only': 'Role must be either buyer, farmer, or admin'
    })
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    }),
    role: Joi.string().valid('buyer', 'farmer', 'admin').optional().messages({
      'any.only': 'Role must be either buyer, farmer, or admin'
    })
  }),

  refresh: Joi.object({
    refreshToken: Joi.string().required().messages({
      'any.required': 'Refresh token is required'
    })
  }),

  verifyToken: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'Token is required'
    })
  }),

  updateProfile: Joi.object({
    profileData: Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional().messages({
        'string.pattern.base': 'Please provide a valid phone number'
      }),
      address: Joi.object({
        street: Joi.string().max(200).optional(),
        city: Joi.string().max(100).optional(),
        state: Joi.string().max(100).optional(),
        country: Joi.string().max(100).optional(),
        zipCode: Joi.string().max(20).optional()
      }).optional(),
      preferences: Joi.object({
        language: Joi.string().valid('en', 'fr', 'sw').default('en').optional(),
        currency: Joi.string().valid('USD', 'LRD', 'UGX').default('USD').optional(),
        notifications: Joi.object({
          email: Joi.boolean().default(true).optional(),
          sms: Joi.boolean().default(false).optional(),
          push: Joi.boolean().default(true).optional()
        }).optional()
      }).optional(),
      farmInfo: Joi.when('role', {
        is: 'farmer',
        then: Joi.object({
          farmName: Joi.string().max(200).optional(),
          farmSize: Joi.number().positive().optional(),
          cropTypes: Joi.array().items(Joi.string()).optional(),
          organicCertified: Joi.boolean().default(false).optional(),
          location: Joi.object({
            latitude: Joi.number().min(-90).max(90).optional(),
            longitude: Joi.number().min(-180).max(180).optional()
          }).optional()
        }).optional(),
        otherwise: Joi.forbidden()
      })
    }).optional()
  })
};

module.exports = {
  authSchemas
};

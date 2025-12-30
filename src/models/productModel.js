// // models/productModel.js
// import mongoose from 'mongoose';

// // const productSchema = new mongoose.Schema({
// //   name: { type: String, required: true },
// //   description: String,
// //   priceCents: { type: Number, required: true }, // integer cents
// //   available: { type: Boolean, default: true },
// //   station: String
// // }, { timestamps: true });

// // export default mongoose.model('Product', productSchema);

// const productSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   description: { type: String },
//   priceCents: { type: Number, required: true }, // integer cents
//   available: { type: Boolean, default: true },
//   isActive: { type: Boolean, default: true }, // for admin toggle
//   station: { type: String, index: true }, // or ObjectId ref to Station model
//   restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }, // optional
//   imageUrl: { type: String },
//   stock: { type: Number, default: null }, // null => unlimited
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // vendor/admin
//   seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' }, // vendor who owns this product
  
//   // Admin oversight fields
//   isFlagged: { type: Boolean, default: false },
//   flagReason: { type: String },
//   flaggedAt: { type: Date },
//   category: { type: String, enum: ['Veg', 'Non-Veg', 'Jain', 'Mixed'], default: 'Veg' },
//   deliveryTimeEstimate: { type: String, default: '30 mins' } // time to prepare this item
// }, { timestamps: true });

// export default mongoose.model('Product', productSchema);


// models/productModel.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  priceCents: { type: Number, required: true }, // price stored in cents
  available: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true }, // for admin toggle
  station: { type: String, index: true }, // or ObjectId ref to Station model
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }, // optional
  imageUrl: { type: String },

  // Stock: 0 = out of stock, null = unlimited stock
  stock: { 
    type: Number, 
    default: 0, 
    validate: {
      validator: function(v) {
        // Allow numeric or null for unlimited
        return v === null || (typeof v === 'number' && v >= 0);
      },
      message: props => `${props.value} is not a valid stock number!`
    }
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // vendor/admin
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' }, // vendor who owns this product

  // Admin oversight fields
  isFlagged: { type: Boolean, default: false },
  flagReason: { type: String },
  flaggedAt: { type: Date },
  category: { type: String, enum: ['Veg', 'Non-Veg', 'Jain', 'Mixed'], default: 'Veg' },
  deliveryTimeEstimate: { type: String, default: '30 mins' } // time to prepare this item
}, { timestamps: true });

// Virtual property to check if stock is unlimited
productSchema.virtual('isUnlimitedStock').get(function() {
  return this.stock === null;
});

// Pre-save middleware to ensure stock is numeric or null
productSchema.pre('save', function(next) {
  if (this.stock === undefined) this.stock = 0; // default numeric
  next();
});

export default mongoose.model('Product', productSchema);

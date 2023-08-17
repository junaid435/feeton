const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  cuoponCode:[
    {
      code:{
        type:String
      },
      incprice:{
        type:Number
      }
    }
  ],
  items: [
    {
      product_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
        required: true,
      },
      total: {
        type: Number,
      },
      price:{
        type:Number,
      
      }
    },
  ],
  grandTotal: {
    type: Number,
  },
  count: {
    type: Number,
    default: 1,
  },
});

module.exports = mongoose.model("Cart", cartSchema);
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Stripe from 'stripe'


// place order COD : /api/order/cod
export const placeOrderCOD = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, address } = req.body;

    if (!address || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid order data" });
    }

    let amount = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: `Product not found: ${item.product}` });
      }
      amount += product.offerPrice * item.quantity;
    }

    // Add 2% tax
    amount += Math.floor(amount * 0.02);

    await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD",
      isPaid: true, // optional: mark COD as paid immediately
    });

    return res.json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message || "Internal Server Error" });
  }
};
// place order stripe : /api/order/stripe
export const placeOrderStripe = async (req, res) => {
    try {
        const userId = req.userId
        const {items, address} = req.body;
        const {origin} = req.headers;
    if(!address || items.length ===0){ 
    return res.json({success:false, message:"Invalid data"})}

    let productData = []

    //calculate amount using items
    let amount = await items.reduce(async (acc, item) => {
        const product = await Product.findById(item.product);
        productData.push({
            name:product.name,
            price:product.offerPrice,
            quantity:item.quantity,
        });
        return (await acc) + product.offerPrice * item.quantity;

    },0)

    //adding tax charge (2%)
    amount += Math.floor(amount * 0.02)

    const order = await Order.create({
        userId,
        items,
        amount,
        address,
        paymentType:'Online',
    })

    //stripe gateway initialize
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
     //create line items for stripe
     const line_items = productData.map((item)=>{
        return {
            price_data:{
                currency:'usd',
                product_data:{
                    name:item.name,
                },
                unit_amount:Math.floor(item.price + item.price *0.02)*100
            },
            quantity:item.quantity,
        }
     })

     //create session 
     const session = await stripeInstance.checkout.sessions.create({
        line_items,
        mode:'payment',
        success_url:`${origin}/loader?next=my-orders`,
        cancel_url: `${origin}/cart`,
        metadata:{
            orderId:order._id.toString(),
            userId,
        }
     })

    return res.json ({success:true, message:'Order Placed Successfully', url:session.url})
    } catch (error) {
        return res.json({success:false , message:error.message})
    }
}

// stripe webhooks to verify payments action : /stripe
export const stripeWebhooks = async (req, res) => {
    //stripe gateway initialize
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)

    const sig = requestAnimationFrame.headers['stripe-signature'];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (error) {
        res.status(400).send(`webhook Error: ${error.message}`)
    }

    //handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':{
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent._id

            //getting session metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId ,
            });

            const {orderId, userId} = session.data[0].metadata;

            //mark payment as paid
            await Order.findByIdAndUpdate(orderId, {isPaid:true})
            //clear user cart
            await User.findByIdAndUpdate(userId, {cartItems:{}})
             break;

        }
        case "payment_intent.payment_failed":{
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent._id

            //getting session metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId ,
            });

            const {orderId} = session.data[0].metadata;
            await Order.findByIdAndDelete(orderId);
            break;

        }
        default:
            console.error(`Unhandled event type: ${event.type}`)
            break;
    }

    res.json({received:true})
}


//order detail of a user : /api/order/user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate({
        path: "items.product",
        model: "Product",
        select: "name category image offerPrice",
      })
      .populate("address")
      .sort({ createdAt: -1 })
      .lean();

    const cleanOrders = orders.map(order => ({
      ...order,
      items: order.items.filter(item => item && item.product),
    }));

    return res.json({ success: true, orders: cleanOrders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Failed to fetch orders" });
  }
};

// get all orders data for seller /admin : /api/order/seller

export const getAllOrders = async (req, res) => {
    try {
       
        const orders = await Order.find({ $or:[{paymentType:'COD'}, {isPaid:true}]}).populate('items.product address').sort({createdAt: -1});
        res.json({success:true, orders});
    } catch (error) {
        res.json({success:false, message:error.message})
    }
}


import User from "../models/User.js"


//update user cartData : /api/cart/update
export const updateCart = async (req, res) => {
    try {
        const userId = req.userId
        const {cartItems} = req.body
        await User.findByIdAndUpdate(userId, {cartItems})
        return res.json({success:true, message: 'cart updated'})
    } catch (error) {
        return res.json({success:false, message:error.message})
    }
}
// import jwt from 'jsonwebtoken'

// const authSeller = async(req, res, next)=>{
//     const {sellerToken} = req.cookies;
//     if(!sellerToken){
//         return res.json({success:false,message:"Not Authorized"})
//     }
//     try {
//             const tokenDecode = jwt.verify(sellerToken, process.env.JWT_SECRET)
//             if(tokenDecode.email === process.env.SELLER_EMAIL){
//                 next();
    
//             }else{
//                 return res.json({success:false, message:'Not Authorized'})
//             }
//             next();
//         } catch (error) {
//             res.json ({success:false , message:error.message})
//         }

// }

// export default authSeller;


import jwt from 'jsonwebtoken'

const authSeller = async(req, res, next)=>{
    const {sellerToken} = req.cookies;
    if(!sellerToken){
        return res.json({success:false,message:"Not Authorized"})
    }
    try {
        const tokenDecode = jwt.verify(sellerToken, process.env.JWT_SECRET)
        if(tokenDecode.email === process.env.SELLER_EMAIL){
            req.seller = tokenDecode; // Optionally, attach decoded token to request for later use
            next(); // Only call next() here if authorized
        }else{
            return res.json({success:false, message:'Not Authorized: Email mismatch'})
        }
    } catch (error) {
        res.json ({success:false , message:error.message})
    }
}

export default authSeller;
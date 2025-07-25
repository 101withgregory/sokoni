import Address from "../models/Address.js";

//add address :/api/address/add
export const addAddress = async(req, res)=>{
    try {
        const userId = req.userId
        const {address} = req.body;
        await Address.create({...address, userId})
        res.json({success:true, message: 'Address added successfully'})
    } catch (error) {
        res.json({success:false, message:error.message})
    }
}

//get address :/api/address/get

export const getAddress = async (req, res) => {
    try {
            const userId = req.userId
            const addresses = await Address.find({userId})
            res.json({success:true, addresses})
    } catch (error) {
        res.json({success:false, message:error.message})
    }
}
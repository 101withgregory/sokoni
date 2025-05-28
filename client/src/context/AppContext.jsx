import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {dummyProducts} from '../assets/assets'
import toast from "react-hot-toast";

export const AppContext = createContext();



export const AppContextProvider = ({children})=>{
    const currency = import.meta.VITE_CURRENCY;
    const navigate = useNavigate();
    const [user, setUser] = useState(null)
    const [isSeller, setIsSeller] = useState(false)
    const [showUserLogin, setShowUserLogin] = useState(false)
    const [products, setProducts] = useState([])
    const [cartItems, setCartIems] = useState({})
    const [searchQuery, setSearchQuery]= useState({})

    
    //fetch All Products
    const fetchProducts = async ()=>{
        setProducts(dummyProducts)
    }
    //add product to cart
    const addToCart = (itemId)=>{
        let cartData = structuredClone(cartItems);
        if(cartData[itemId]){
            cartData[itemId] += 1;
        }else{
            cartData[itemId] = 1
        }
        setCartIems(cartData)
        toast.success("Added to cart")
    }
    //update cart item quantity
    const updateCartItem = (itemId, quantity)=>{
        let cartData = structuredClone(cartItems);
        cartData[itemId] = quantity
        setCartIems(cartData)
        toast.success('Cart Updated')
    }
    //remove product from cart
    const removeFromCart = (itemId)=>{
         let cartData = structuredClone(cartItems);
         if(cartData[itemId]){
            cartData[itemId] -= 1
            if(cartData[itemId] === 0){
                delete cartData[itemId]
            }
         }
         toast.success('Removed From Cart')
         setCartIems(cartData)
    }
    useEffect(()=>{
        fetchProducts()
    },[])
    const value = {navigate, user, setUser, isSeller, setIsSeller, showUserLogin, setShowUserLogin,products, setProducts,currency,addToCart,updateCartItem, removeFromCart,cartItems,searchQuery, setSearchQuery}
     return <AppContext.Provider value={value}>
        {children}
     </AppContext.Provider>
}

export const useAppContext = ()=>{
    return useContext(AppContext)
}
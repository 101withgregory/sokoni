import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import {dummyProducts} from '../assets/assets'
import toast from "react-hot-toast";


axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.withCredentials = true;
export const AppContext = createContext();



export const AppContextProvider = ({children})=>{
    const currency = import.meta.env.VITE_CURRENCY;
    
    const navigate = useNavigate();
    const [user, setUser] = useState(null)
    const [isSeller, setIsSeller] = useState(false)
    const [showUserLogin, setShowUserLogin] = useState(false)
    const [products, setProducts] = useState([])
    const [cartItems, setCartItems] = useState({})
    const [searchQuery, setSearchQuery]= useState({})
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // Function to verify user authentication status (runs on app load/refresh)
    const checkUserAuthentication = async () => {
        setLoadingAuth(true); // Start loading state
        try {
            // This API call will automatically send the 'token' cookie.
            // Backend's authUser middleware will verify it and `isAuth` will return user data.
            const { data } = await axios.get('/api/user/is-auth');
            if (data.success && data.user) {
                setIsLoggedIn(true);
                setUser(data.user); // Set the user data from the backend
                // If you have a separate seller check, you might trigger it here too
                // For now, let's assume 'user' implies logged in, and 'isSeller' is separate
                console.log("User re-authenticated successfully:", data.user.email);
            } else {
                setIsLoggedIn(false);
                setUser(null);
                console.log("No active user session found or token invalid.");
            }
        } catch (error) {
            setIsLoggedIn(false);
            setUser(null);
            console.error("Error checking user authentication status:", error.message);
            // On error, perhaps clear cookie if it's a persistent problem
            // For production, avoid toast.error here, as it might appear on every page load if token is expired.
        } finally {
            setLoadingAuth(false); // End loading state regardless of outcome
        }
    };

    // Similarly, a check for seller authentication if it's distinct
    const checkSellerAuthentication = async () => {
        // You can combine this with checkUserAuthentication if a seller is also a user
        // Or if seller is a completely separate login, have a separate /api/seller/is-auth
        // For simplicity, let's assume isSeller is also part of the user object or a separate check.
        // Assuming you have a /api/seller/is-auth endpoint:
        try {
            const { data } = await axios.get('/api/seller/is-auth'); // You'd need to create this backend endpoint
            if (data.success) {
                setIsSeller(true);
            } else {
                setIsSeller(false);
            }
        } catch (error) {
            setIsSeller(false);
            console.error("Error checking seller authentication:", error.message);
        }
    };


    // This useEffect runs ONLY ONCE when AppProvider mounts (on initial app load/refresh)
    useEffect(() => {
        const authenticateBoth = async () => {
            // Run both checks in parallel or sequentially
            await checkUserAuthentication();
            await checkSellerAuthentication(); // Run after user check, or in parallel
            setLoadingAuth(false); // Set loading to false ONLY after all checks are complete
        };
        authenticateBoth();
    }, []); 

    
    // fetch seller status
    const fetchSeller = async()=>{
        try {
            const {data} = await axios.get('/api/seller/is-auth');
            if(data.success){
                setIsSeller(true)
            }else{
                setIsSeller(false)
            }
        } catch (error) {
            setIsSeller(false);
        }
    }
    //fetch user auth status, cartdata and cart items

    const fetchUser = async () => {
        try {
            const {data} = await axios.get('/api/user/is-auth');
            if(data.success){
                setUser(data.user)
                setCartItems(data.user.cartItems)
            }
        } catch (error) {
            setUser(null)
        }
    }

    
    //fetch All Products
    const fetchProducts = async ()=>{ 
        try {
         const {data} = await axios.get('/api/product/list')
        if(data.success){
            toast.success(data.message)
            setProducts(data.products)
        }else{
            toast.error(data.message)
        }   
        } catch (error) {
            toast.error(error.message)
        }
        
        
    }
    //add product to cart
    const addToCart = (itemId)=>{
        let cartData = structuredClone(cartItems);
        if(cartData[itemId]){
            cartData[itemId] += 1;
        }else{
            cartData[itemId] = 1
        }
        setCartItems(cartData)
        toast.success("Added to cart")
    }
    //update cart item quantity
    const updateCartItem = (itemId, quantity)=>{
        let cartData = structuredClone(cartItems);
        cartData[itemId] = quantity
        setCartItems(cartData)
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
         setCartItems(cartData)
    }
    //get cart item count
    const getCartCount = ()=>{
        let totalCount = 0;
        for(const item in cartItems){
            totalCount+=cartItems[item];
        }
        return totalCount;
    }
    // get cart total amount
    const getCartAmount = ()=>{
        let totalAmount = 0;
        for(const item in cartItems){
            let itemInfo = products.find((product) => product._id === item);
            if(cartItems[item] > 0){
                totalAmount += itemInfo.offerPrice * cartItems[item]
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }
    useEffect(()=>{
        fetchUser()
        fetchSeller()
        fetchProducts()
        
    },[])
    //updata cartitems for database
    useEffect(()=>{
        const updateCart = async (params) => {
            try {
                const {data} = await axios.post('/api/cart/update', {cartItems})
                if(!data.success){
                    toast.error(data.message)
                }
            } catch (error) {
                toast.error(error.message)
            }
        }
        if(user){
            updateCart()
        }
    },[cartItems])
    const value = {navigate, user, setUser, isSeller, setIsSeller, showUserLogin, setShowUserLogin,products, setProducts,currency,addToCart,updateCartItem, removeFromCart,cartItems,searchQuery, setSearchQuery, getCartCount, getCartAmount,axios,fetchProducts, setCartItems,isLoggedIn, setIsLoggedIn,loadingAuth}
     return <AppContext.Provider value={value}>
        {children}
     </AppContext.Provider>
}

export const useAppContext = ()=>{
    return useContext(AppContext)
}
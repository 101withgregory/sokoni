// client/src/App.jsx
import React from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import { Route, Routes, useLocation, Navigate } from 'react-router-dom' 
import { Toaster } from "react-hot-toast"
import Footer from './components/Footer'
import Login from './components/Login'
import { useAppContext } from './context/AppContext' 
import AllProducts from './pages/AllProducts'
import ProductCategory from './pages/ProductCategory'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import AddAddress from './pages/AddAddress'
import MyOrders from './pages/MyOrders'
import SellerLogin from './components/seller/SellerLogin'
import SellerLayout from './pages/seller/SellerLayout'
import AddProduct from './pages/seller/AddProduct'
import ProductList from './pages/seller/ProductList'
import Orders from './pages/seller/Orders'
import Loading from './components/Loading' 


// Separate component to be wrapped by AppProvider
function App() {
    const { showUserLogin, isSeller, isLoggedIn, loadingAuth } = useAppContext(); // Get isLoggedIn and loadingAuth
    const isSellerPath = useLocation().pathname.includes('seller');

    // Display a loading indicator while authentication status is being checked
    if (loadingAuth) {
        return <Loading />; // Or a simple <div>Loading...</div>
    }

    return (
        <div className='text-default min-h-screen text-gray-700 bg-white'>

            {isSellerPath ? null : <Navbar />}
            {showUserLogin ? <Login /> : null}
            <Toaster />
            <div className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
                <Routes>
                    {/* Public Routes */}
                    <Route path='/' element={<Home />} />
                    <Route path='/products' element={<AllProducts />} />
                    <Route path='/products/:category' element={<ProductCategory />} />
                    <Route path='/products/:category/:id' element={<ProductDetails />} />
                    <Route path='/cart' element={<Cart />} /> {/* Cart can be accessed unauthenticated, but checkout needs auth */}
                    <Route path='/loader' element={<Loading />} /> {/* Used for Stripe redirects */}

                    {/* User-Specific Protected Routes */}
                    <Route
                        path='/add-address'
                        element={isLoggedIn ? <AddAddress /> : <Navigate to="/login" replace />} // Redirect to general user login
                    />
                    <Route
                        path='/my-orders'
                        element={isLoggedIn ? <MyOrders /> : <Navigate to="/login" replace />} // Redirect to general user login
                    />

                    {/* Seller-Specific Protected Routes (Assuming `isSeller` handles this) */}
                    {/* The '/seller' route acts as a base for all seller sub-routes */}
                    <Route path='/seller' element={isSeller ? <SellerLayout /> : <SellerLogin />}>
                        {/* index route for /seller, redirect if not seller */}
                        <Route index element={isSeller ? <AddProduct /> : <Navigate to="/seller/login" replace />} />
                        {/* Nested seller routes, protected by parent element */}
                        <Route path='product-list' element={<ProductList />} />
                        <Route path='orders' element={<Orders />} />
                    </Route>
                    {/* If SellerLogin is a standalone route not nested under /seller, ensure it's here */}
                    {/* <Route path='/seller/login' element={<SellerLogin />} /> */}

                    {/* General User Login (if it's at /login) */}
                    {/* Add a specific route for user login if it's different from showUserLogin's modal */}
                    {/* <Route path='/login' element={<LoginPageComponent />} /> */}
                </Routes>
            </div>
            {!isSellerPath && <Footer />}
        </div>
    )
}

export default App;


// import React from 'react'
// import Navbar from './components/Navbar'
// import Home from './pages/Home'
// import { Route, Routes, useLocation } from 'react-router-dom'
// import {Toaster} from "react-hot-toast"
// import Footer from './components/Footer'
// import Login from './components/Login'
// import { useAppContext } from './context/AppContext'
// import AllProducts from './pages/AllProducts'
// import ProductCategory from './pages/ProductCategory'
// import ProductDetails from './pages/ProductDetails'
// import Cart from './pages/Cart'
// import AddAddress from './pages/AddAddress'
// import MyOrders from './pages/MyOrders'
// import SellerLogin from './components/seller/SellerLogin'
// import SellerLayout from './pages/seller/SellerLayout'
// import AddProduct from './pages/seller/AddProduct'
// import ProductList from './pages/seller/ProductList'
// import Orders from './pages/seller/Orders'
// import Loading from './components/Loading'
// function App() {
//   const {showUserLogin, isSeller} = useAppContext();
//   const isSellerPath = useLocation().pathname.includes('seller');
//   return (
//     <div className='text-default min-h-screen text-gray-700 bg-white'>
      
//       {isSellerPath ?  null : <Navbar/>}
//       {showUserLogin ? <Login/> : null}
//       <Toaster/>
//       <div className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
//         <Routes>
//           <Route path='/' element={<Home/>}/>
//           <Route path='/products' element={<AllProducts/>}/>
//           <Route path='/products/:category' element={<ProductCategory/>}/>
//           <Route path='/products/:category/:id' element={<ProductDetails/>}/>
//           <Route path='/cart' element={<Cart/>}/>
//           <Route path='/add-address' element={<AddAddress/>}/>
//           <Route path='/my-orders' element={<MyOrders/>}/>
//           <Route path='/loader' element={<Loading/>}/>
//           <Route path='/seller' element={isSeller ? <SellerLayout/> : <SellerLogin/>}>
//            <Route index element={isSeller ? <AddProduct/> : null}/>
//            <Route path='product-list' element={ <ProductList/>}/>
//            <Route path='orders' element={ <Orders/>}/>
//           </Route>
//         </Routes>
//       </div>
//       {!isSellerPath && <Footer/>}
//     </div>
//   )
// }

// export default App
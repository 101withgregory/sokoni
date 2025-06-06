import React from 'react'
import { assets, categories } from '../assets/assets'
import { useAppContext } from '../context/AppContext'

function Categories() {
    const {navigate} = useAppContext()
  return (
    <div className='mt-16'>
        <p className='text-2xl md:text-3xl font-medium'>Categories</p>
        <div className='mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3'>
             {
                categories.map((category, index)=>(
<div key={index} className='group cursor-pointer py-5 px-3 rounded-lg flex flex-col justify-center items-center' style={{backgroundColor:category.bgColor}}
onClick={()=>{navigate(`/products/${category.path.toLowerCase()}`); scrollTo(0,0)}}>
                <img src={category.image} alt="" className='group-hover:scale-108 transition max-w-28'/>
                <p className='font-medium text-sm'>{category.text}</p>
            </div>
                ))
             }

            
        </div>
    </div>
  )
}

export default Categories   
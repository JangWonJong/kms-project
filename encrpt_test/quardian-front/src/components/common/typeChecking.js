import React from 'react';


// API, Static 타입을 분류하는 기능
// 현재 사용되어지고 있지 않은 기능
export const typeCheckingAPI = (e,setTypeCheck) =>{
        if(e.target.value=='on'){
            setTypeCheck(false)
        }
    }
export  const typeCheckingStatic = (e,setTypeCheck,setEndPointValue)=>{
        if(e.target.value=='on'){
            setTypeCheck(true)
            setEndPointValue('')
        }
    }
export  const endPointChange =(e,setEndPointValue)=>{
        setEndPointValue(e.target.value)
}


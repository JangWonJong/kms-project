import React, {useEffect} from 'react';
import {useState} from "react";
import DateSelect from "../../common/dateSelect";
import {Pbkdf} from "../../api/keyAPI";
import KdfInsertButton from './kdf_button';
import Cookies from 'js-cookie';


const PbkdfCreate = ({getClick, setLoginData}) => {
    //const [keyValue,setKeyValue] =useState('')
    const [hashValue, setHashValue] = useState('')
    const [flag, setFlag] = useState(false)
    const [inputId, setInputId] = useState('')

//data 전송 빈값넘어감---해결해야함
    //const readID = window.sessionStorage.getItem("user_data");
    // const readID = JSON.parse(sessionStorage.getItem("user_data")).user_id
    const readID = JSON.parse(Cookies.get("user_id")).user_id
    const handelSubmit = (e) => {
       e.preventDefault()
       const user_id = readID
       const input_password = e.target.input_password.value

       Pbkdf(user_id, input_password).then(res=>{
        setHashValue(res)
        setFlag(!flag)
        getClick("PbkdfCreate")
       })
   }
   useEffect(()=>{},[flag])
    
    const handleInputId = (e) => {
        setInputId(e.target.value)
    }
   

    return (
        <div>
            <div className="container-fluid pt-4 px-4">
                <div className="row g-4">
                    <div className="bg-light rounded h-100 p-4">
                        <h6 className="mb-4">Get KEK</h6>
                        <div className="row mb-3">
                        </div>
                        <form onSubmit={handelSubmit}>
                       
                        <div className="row mb-3">
                            <label htmlFor="inputValue" className="col-sm-2 col-form-label">ID</label>
                            <div className="col-sm-10">
                                <textarea readOnly={true} className="form-control" aria-label="With textarea" id='user_id'
                                          // onChange={()=>dummyChange()} style={{height:"150px"}}   value={keyValue} key={def.key_name}/>
                                         value={readID} style={{height:"75px"}}/>
                            </div>
                        </div>
                        <div className="row mb-3">
                            <label htmlFor="inputSize" className="col-sm-2 col-form-label">PASSWORD</label>
                            <div className="col-sm-10">
                                <input  type="password"  className="form-control" id="input_password"></input>
                            </div>
                        </div>
                        <div className="row mb-3">
                            <label htmlFor="inputValue" className="col-sm-2 col-form-label">KEK</label>
                            <div className="col-sm-10">
                                <textarea readOnly={true} className="form-control" aria-label="With textarea"
                                          // onChange={()=>dummyChange()} style={{height:"150px"}}   value={keyValue} key={def.key_name}/>
                                         value={(hashValue)} style={{height:"75px"}}/>
                            </div>
                        </div>
                        
                        <button type="submit" className="btn btn-primary">Generate KEK</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )



   
    
};

export default PbkdfCreate;
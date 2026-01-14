import React, {useEffect} from 'react';
import {useState} from "react";
import DateSelect from "../../common/dateSelect";
import {ApiCreate, GetCurrentToken, KeyDefInsert} from "../../api/keyAPI";

const ApiKeyCreate = () => {
    const [uuidCheck, setUUIDCheck] = useState( false)
    const [keyValue,setKeyValue] =useState('')
    const [sizeValue,setSizeValue] =useState('')
    const [token,setToken] =useState('')
    const [startDate, setStartDate] = useState(new Date());


    const handelSubmit = (e) => {
        e.preventDefault();
        const type = e.target.data_type.value
        const size = e.target.size.value
        const expireDate = e.target.expire_date.value
        const token =e.target.token.value
        ApiCreate(type,size,expireDate,token).then(res=>{
            setKeyValue(res)
        })
    }
    useEffect(()=>{
        // GetCurrentToken().then(rer=>{
        //     setToken(rer)
        // })
    },[])
    const timeChange =(date)=>{
        setStartDate(date)
    }
    const sizeChange=(e)=>{
        setSizeValue(e.target.value)
    }

    const typeCheck2 = (e)=>{
        if(e.target.value=='UUID'){
            setUUIDCheck(true)
            setSizeValue('')
        }
        else {
            setUUIDCheck(false)
        }
    }
    return (
        <div>
            <div className="container-fluid pt-4 px-4">
                <div className="row g-4">
                    <div className="bg-light rounded h-100 p-4">
                        <h6 className="mb-4">Api Key Create</h6>
                        <div className="row mb-3">
                            {/*<label htmlFor="inputSize" className="col-sm-2 col-form-label">Current Token</label>*/}
                            {/*<div className="col-sm-10">*/}
                            {/*    <input type="text" disabled={true} defaultValue={token} className="form-control">*/}
                            {/*    </input>*/}
                            {/*</div>*/}
                        </div>
                        <form onSubmit={handelSubmit}>
                            <div className="row mb-3">
                                <label htmlFor="inputSize" className="col-sm-2 col-form-label">Token</label>
                                <div className="col-sm-10">
                                    <input type="text" className="form-control" id={"token"}>
                                    </input>
                                </div>
                            </div>
                        <div className="row mb-3">
                            <label htmlFor="inputDataType" className="col-sm-2 col-form-label">Data Type</label>
                            <div className="col-sm-10">
                                <select className="form-select mb-3" aria-label="Default select example"
                                        onChange={(e)=>typeCheck2(e)}  id="data_type">
                                    <option value="hex">HEX</option>
                                    <option value="digit">Digit</option>
                                    <option value="bytes">Bytes</option>
                                    <option value="short_string">Short String</option>
                                    {/*<option value="AES_key">AES</option>*/}
                                    <option value="UUID">UUID</option>
                                    {/*<option value="AES_nonce">nonce</option>*/}
                                </select>
                            </div>
                        </div>
                        <div className="row mb-3">
                            <label htmlFor="inputValue" className="col-sm-2 col-form-label">Value</label>
                            <div className="col-sm-10">
                                <textarea readOnly={true} className="form-control" aria-label="With textarea"
                                          // onChange={()=>dummyChange()} style={{height:"150px"}}   value={keyValue} key={def.key_name}/>
                                         value={keyValue} style={{height:"150px"}}/>
                            </div>
                        </div>
                        <div className="row mb-3">
                            <label htmlFor="inputSize" className="col-sm-2 col-form-label">Size</label>
                            <div className="col-sm-10">
                                <input readOnly={uuidCheck} onChange={sizeChange} value={sizeValue} type="text" className="form-control" id="size">
                                </input>
                            </div>
                        </div>
                        <div className="row mb-3">
                            <label htmlFor="inputExpireDate" className="col-sm-2 col-form-label">Expire Date</label>
                            <div className="col-sm-10">
                                <DateSelect timeChange={timeChange} startDate={startDate}/>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary">Save</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyCreate;
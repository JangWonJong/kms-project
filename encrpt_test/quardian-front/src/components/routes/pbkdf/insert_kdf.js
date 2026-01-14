import React from 'react';
import {useEffect, useState} from "react";
import {KeyDefInsert, KeyDefUpdate, KeyList} from "../../api/keyAPI";
import "react-datepicker/dist/react-datepicker.css"
import DateSelect from "../../common/dateSelect";

const InsertKdf = ({getClick}) => {

    // 키 목록 유지
    const [keyListArr, setKeyListArr] = useState('')

    // 화면 갱신
    const [flag, setFlag] = useState(false)

    // UUID 타입 체크
    const [uuidCheck, setUUIDCheck] = useState( false)

    // 사이즈 유지
    const [sizeValue,setSizeValue] =useState('')
    // 시작일 설정
    const [startDate, setStartDate] = useState(new Date());

    const [typeCheck,setTypeCheck] = useState()
    const [endpointValue, setEndPointValue] =useState('')
    let arr = []

    // 한국 시간 변화 기능
    const offset= 1000*60 *60 *9
    const kortime = new Date((new Date()).getTime()+offset)
    const kort = kortime.toISOString().replace("T", " ").split('.')[0]


    // 시간 변화 기능
    const timeChange =(date)=>{
        setStartDate(date)
    }

    // useEffect 사용한 처음 데이터 리스트 불러오기기
    useEffect(()=>{
        KeyList().then(res=>{
            // arr = (res.data.map(row => row.key_name)
            arr = (res.data.map(row => row._id))
            setKeyListArr(arr)
        })
    },[flag])

    function to_date2(date_str)
    {
        const yyyyMMdd = String(date_str);
        const sYear = yyyyMMdd.substring(0,4);
        const sMonth = yyyyMMdd.substring(5,7);
        const sDate = yyyyMMdd.substring(8,10);

        const hour = yyyyMMdd.substring(11, 14);
        const minute = yyyyMMdd.substring(15, 17);
        const second = yyyyMMdd.substring(18, 20);

        //alert("sYear :"+sYear +"   sMonth :"+sMonth + "   sDate :"+sDate);
        return new Date(Number(sYear), Number(sMonth)-1, Number(sDate), Number(hour),Number(minute));
    }
    function to_date2_utc(date_str)
    {
        const yyyyMMdd = String(date_str);
        const sYear = yyyyMMdd.substring(0,4);
        const sMonth = yyyyMMdd.substring(5,7);
        const sDate = yyyyMMdd.substring(8,10);

        const hour = yyyyMMdd.substring(11, 14);
        const minute = yyyyMMdd.substring(15, 17);
        const second = yyyyMMdd.substring(18, 20);
        //alert("sYear :"+sYear +"   sMonth :"+sMonth + "   sDate :"+sDate);
        return new Date(Date.UTC(Number(sYear), Number(sMonth)-1, Number(sDate), Number(hour),Number(minute)));
    }

    const handelSubmit = (e) => {
        e.preventDefault();

        const checkType= (e)=>{
            const tres=  e.target.gridRadios1.checked===true? "API TYPE": "STATIC TYPE"
            return tres
        }
        // 데이터 형태 생성 기능
        const defRes = {
            "_id": e.target.key_name.value,
            // "key_name": e.target.key_name.value,
            // "key_type": checkType(e),
            // "proj_privilege":e.target.proj_privilege.value,
            "user_group":e.target.user_group.value,
            // "end_point":e.target.end_point.value,
            "data_type":e.target.data_type.value,
            "size":e.target.size.value,
            "requester":e.target.requester.value,
            // "r_expire_date":to_date2_utc(e.target.expire_date.value),
            "expire_date":e.target.expire_date.value,
            "issue_date":kort,
            "key_value":''
        }

        KeyDefInsert(defRes).then(res=>{
            setFlag(!flag)
            getClick("KeyDefinition")
        })
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
    const sizeChange=(e)=>{
        setSizeValue(e.target.value)
    }

    return (
        <div className="container-fluid pt-4 px-4">
            <div className="row g-4">
                <div className="col-sm-12 col-xl-4">
                    <div className="bg-light rounded h-100 p-4">
                        <h6 className="mb-4">Key List</h6>
                        <form>
                            <div className="mb-3">
                                <select className="form-select" size="10" disabled={true} >
                                    {keyListArr && keyListArr.map(((key, idx) => <option
                                            key={key}>{keyListArr[idx]}</option>
                                    ))}
                                </select>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="col-sm-12 col-xl-8">
                    <div className="bg-light rounded h-100 p-4"  >
                        <h6 className="mb-4">Key Definition</h6>
                        <form onSubmit={handelSubmit}>
                            
                            <div className="row mb-3">
                                <label htmlFor="inputUserGroup" className="col-sm-2 col-form-label">User Group</label>
                                <div className="col-sm-10">
                                    <input type="text" className="form-control" id="user_group">
                                    </input>
                                </div>
                            </div>
                         
                            <div className="row mb-3">
                                <label htmlFor="inputKeyName" className="col-sm-2 col-form-label">Key Name</label>
                                <div className="col-sm-10">
                                    <input type="text" className="form-control" id="key_name">
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
                                        <option value="short_string">Short String</option>
                                        <option value="bytes">Bytes</option>
                                        <option value="UUID">UUID</option>
                                    </select>
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
                                <label htmlFor="inputRequester"  className="col-sm-2 col-form-label">Key&nbsp;Manager</label>
                                <div className="col-sm-10">
                                    <input type="text" className="form-control" id="requester">
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

export default InsertKdf;
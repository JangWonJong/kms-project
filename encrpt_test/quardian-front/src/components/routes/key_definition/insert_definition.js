import React from 'react';
import {useEffect, useState} from "react";
import {KeyDefInsert, KeyList} from "../../api/keyAPI";
import "react-datepicker/dist/react-datepicker.css"
import DateSelect from "../../common/dateSelect";
import Swal from 'sweetalert2';

const InsertDefinition = ({getClick}) => {

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
        return new Date(Date.UTC(Number(sYear), Number(sMonth)-1, Number(sDate), Number(hour),Number(minute)));
    }

    const handelSubmit = (e) => {
        e.preventDefault();
        // 데이터 형태 생성 기능
        const defRes = {
            "_id": e.target.key_name.value,
            "user_group":e.target.user_group.value,
            "data_type":e.target.data_type.value,
            "size":e.target.size.value,
            "requester":e.target.requester.value,
            // "expire_date":e.target.expire_date.value,
            "expire_date":expireDateSixMonth,
            "issue_date":kort,
        }
        
        KeyDefInsert(defRes).then(res=>{
            if (res == "Key Error"){
                Swal.fire("사용중인 키 이름입니다", '', 'warning')
            }
            else if (res == "failed") {
                Swal.fire("정보를 입력해주세요",'','warning')
            } 
            else{
                setFlag(!flag)
                Swal.fire("키 정보 입력완료","암호화키 이름: "+e.target.key_name.value,'success')
                getClick("KeyDefinition")
            }
           
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

    // 키 만료일 키 생성시점 기준으로 6개월 이후로 고정.
    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

    // 년월일
    const expireDateSixMonth = `${sixMonthsLater.getFullYear()}-${(sixMonthsLater.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${sixMonthsLater.getDate().toString().padStart(2, "0")}`;

    
    return (
        <div className="container-fluid pt-4 px-4">
            <div className="row g-4">
                <div className="col-sm-12 col-xl-4">
                    <div className="bg-light rounded h-100 p-4">
                        <h6 className="mb-4">발급 키 목록</h6>
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
                        <h6 className="mb-4">키 정보</h6>
                        <form onSubmit={handelSubmit}>
                            
                            <div className="row mb-3">
                                <label htmlFor="inputUserGroup" className="col-sm-2 col-form-label">사용 용도</label>
                                <div className="col-sm-10">
                                    <input type="text" className="form-control" id="user_group">
                                    </input>
                                </div>
                            </div>
                         
                            <div className="row mb-3">
                                <label htmlFor="inputKeyName" className="col-sm-2 col-form-label">키 이름</label>
                                <div className="col-sm-10">
                                    <input type="text" className="form-control" id="key_name">
                                    </input>
                                </div>
                            </div>
                           
                            <div className="row mb-3">
                                <label htmlFor="inputDataType" className="col-sm-2 col-form-label">키 타입</label>
                                <div className="col-sm-10">
                                    <select className="form-select mb-3" aria-label="Default select example"
                                            onChange={(e)=>typeCheck2(e)}  id="data_type">
                                        <option value="bytes">Bytes</option>
                                        <option value="digit">Digit</option>
                                        <option value="UUID">UUID</option>
                                        <option value="hex">HEX</option>
                                        <option value="short_string">Short String</option>
                                    </select>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <label htmlFor="inputSize" className="col-sm-2 col-form-label">키 길이</label>
                                <div className="col-sm-10">
                                    <input readOnly={uuidCheck} onChange={sizeChange} value={sizeValue} type="number" max={1024}className="form-control" id="size">
                                    </input>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <label htmlFor="inputRequester"  className="col-sm-2 col-form-label">키 관리자</label>
                                <div className="col-sm-10">
                                    <input type="text" className="form-control" id="requester">
                                    </input>
                                </div>
                            </div>
                           
                            <div className="row mb-3">
                                <label htmlFor="inputExpireDate" className="col-sm-2 col-form-label">키 만료일</label>
                                <div className="col-sm-10">
                                   {/* <DateSelect timeChange={timeChange} startDate={startDate}/> */}
                                   <input type="text" readOnly={true} className="form-control" value={expireDateSixMonth}/>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary">저장</button>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InsertDefinition;
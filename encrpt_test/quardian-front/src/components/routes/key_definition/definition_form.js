import React, {useState} from 'react';
import {KeyDefSave, KeyDefUpdate, keyDelete} from "../../api/keyAPI";
import DefInsertButton from "./def_insert_button";
import Modal from "../../common/modal";
import DateSelect from "../../common/dateSelect";
import {endPointChange, typeCheckingAPI, typeCheckingStatic} from "../../common/typeChecking";
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';



const DefinitionForm = ({keyListArr,setCurrentView,changeFlag}) => {
    const setIp = 'https://192.168.0.4:5000'

    // 데이터 유지
    const [def, setDef] = useState('')

    // UUID 타입인지 체크
    const [uuidCheck, setUUIDCheck] = useState( false)

    // 모달 열기 및 내용
    const [modalOpen, setModalOpen] = useState(false);
    const [modalComment, setModalComment] = useState('');

    // 시작일 설정
    const [startDate, setStartDate] = useState(new Date());

    const [typeCheck,setTypeCheck] = useState()
    const [endpointValue, setEndPointValue] =useState('')

    const [keyValue,setKeyValue] =useState('')

    // API 타입 체크 기능 (현재 사용하지 않음)
    const tc =(data) =>{
        const res = data.key_type =='API TYPE'? false : true
                return res
    }

    // 시간 데이터 포맷 변경 기능
    function to_date2(date_str)
    {
        const yyyyMMdd = String(date_str);
        const sYear = yyyyMMdd.substring(0,4);
        const sMonth = yyyyMMdd.substring(5,7);
        const sDate = yyyyMMdd.substring(8,10);
        const hour = yyyyMMdd.substring(11, 14);
        const minute = yyyyMMdd.substring(15, 17);
        const a = new Date(Number(sYear), Number(sMonth)-1, Number(sDate))
        const tt = new Date(Date.UTC(Number(sYear), Number(sMonth)-1, Number(sDate)))
        
        const t = new Date(Number(sYear), Number(sMonth)-1, Number(sDate), Number(hour),Number(minute));
        return tt
    }

    const postDefData = (post) => {
        KeyDefSave(post).then(data => {

            setDef(data)
            setKeyValue(data.size)
            setTypeCheck(tc(data))
            setEndPointValue(data.end_point)
            setStartDate(to_date2(data.expire_date))
            if(data.data_type=='UUID'){
                setUUIDCheck(true)
            }
        })
    }
    // 데이터 전송 처리 부분
    const handelSubmit = (e) => {
        e.preventDefault();
        
        // 데이터 폼 형성
        const defRes = {
            "_id": e.target.key_name.value,
            "user_group":e.target.user_group.value,
            //"data_type":e.target.data_type.value,
            "size":e.target.size.value,
            "issue_date":e.target.issue_date.value,
            "requester":e.target.requester.value,
            "expire_date":expireDateSixMonth,
        }
        if(e.target.key_name.value===''){
            Swal.fire("변경 할 키를 선택해주세요",'','warning')
            //setModalComment("Save failed")
            //openModal()
            return
        }
        else{
        KeyDefUpdate(defRes).then(res=>{
            Swal.fire("변경 완료")
            //setModalComment("Save Success")
            //openModal()
        })
        }
    }

    const handleChange = (e) => {
        // const keyNamePost = {"key_name": e.target.value}
        const keyNamePost = {"_id": e.target.value}
        postDefData(keyNamePost)
        setUUIDCheck(false)
    };

    const typeCheck2 = (e)=>{
        if(e.target.value=='UUID'){
            setUUIDCheck(true)
            setKeyValue('')
        }
        else {
            setUUIDCheck(false)
        }
    }
    const changeSize =(e)=>{
        setKeyValue(e.target.value)
    }


    const openModal = () => {
        setModalOpen(true);
    };
    const closeModal = () => {
        setModalOpen(false);
    };
    const deleteKey =()=>{
        keyDelete({"_id":def.key_name}).then(res=>{
            setDef('')
            setKeyValue('')
            setEndPointValue('')
            setStartDate(new Date())
            changeFlag()
            // window.location.reload()
        })
    }
    const timeChange =(date)=>{
        setStartDate(date)
    }

    const loginCheck = () => {
        const userData = Cookies.get('user_id');
        if (userData) {
          try {
            const userId = userData;
            fetch( setIp + '/decode_token', {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(userId),
              credentials: 'include',
            })
              .then((response) => response.json())
              .then((data) => {
                if (data.valid) {
                    deleteKey()
                } else {
                    alert("인증이 유효하지 않습니다, 다시 로그인해주세요.")
                    // console.error('Token is not valid:', data.error);
                    setCurrentView('Login');
                }
              })
              .catch((error) => {
                    alert("인증이 유효하지 않습니다, 다시 로그인해주세요.")
                    // console.error('Error verifying token:', error);
                    setCurrentView('Login');
              });
          } catch (error) {
                alert("인증이 유효하지 않습니다, 다시 로그인해주세요.")
                // console.error('Error parsing user data:', error);
                setCurrentView('Login');
          }
        } else {
            setCurrentView('Login');
        }
      };




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
                                <select className="form-select" size="10" onChange={handleChange}>
                                    {keyListArr && keyListArr.map(((key, idx) => <option
                                            key={key}>{keyListArr[idx]}</option>
                                    ))}
                                </select>
                            </div>
                           <DefInsertButton setCurrentView={setCurrentView}></DefInsertButton>
                        </form>
                    </div>
                </div>
                <div className="col-sm-12 col-xl-8">
                    <div className="bg-light rounded h-100 p-4">
                        <h6 className="mb-4">키 정보</h6>
                        <form onSubmit={handelSubmit}>
                            
                            <div className="row mb-3">
                                <label htmlFor="inputUserGroup" className="col-sm-2 col-form-label">사용 용도</label>
                                <div className="col-sm-10">
                                    <input type="text" defaultValue={def.user_group} key={def._id} className="form-control" id="user_group">
                                    </input>
                                </div>
                            </div>
                            

                            <div className="row mb-3">
                                <label htmlFor="inputKeyName" className="col-sm-2 col-form-label">키 이름</label>
                                <div className="col-sm-10">
                                    <input readOnly={true} type="text" className="form-control" id="key_name"
                                           defaultValue={def._id} key={def._id}>
                                    </input>
                                </div>
                            </div>

                            {/* <div className="row mb-3">
                                <label htmlFor="inputDataType" className="col-sm-2 col-form-label">키 타입</label>
                                <div className="col-sm-10">
                                    <select className="form-select mb-3" aria-label="Default select example"
                                         onChange={(e)=>typeCheck2(e)}   defaultValue={def.data_type} key={def._id} id="data_type">
                                        <option value="bytes">Bytes</option>
                                        <option value="digit">Digit</option>
                                        <option value="UUID">UUID</option>
                                        <option value="hex">HEX</option>
                                        <option value="short_string">Short String</option>
                                    </select>
                                </div>
                            </div> */}

                            <div className="row mb-3">
                                <label htmlFor="inputSize" className="col-sm-2 col-form-label">키 길이</label>
                                <div className="col-sm-10">
                                    <input readOnly={true} type="number" max={1024} className="form-control" id="size"
                                          onChange={(e)=>changeSize(e)} value={keyValue} key={def._id}>
                                    </input>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <label htmlFor="inputIssueDate" className="col-sm-2 col-form-label">발급일</label>
                                <div className="col-sm-10">
                                    <input readOnly={true} type="text" className="form-control" id="issue_date"
                                           defaultValue={def.issue_date} key={def._id}>
                                    </input>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <label htmlFor="inputRequester" className="col-sm-2 col-form-label">키 관리자</label>
                                <div className="col-sm-10">
                                    <input type="text" className="form-control" id="requester"
                                           defaultValue={def.requester} key={def._id}>
                                    </input>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <label htmlFor="inputExpireDate" className="col-sm-2 col-form-label">키 만료일</label>

                                <div className="col-sm-10">
                                    {/*<DateSelect startDate={startDate} timeChange={timeChange}></DateSelect>*/}

                                {/* 키 만료일 표시 */}

                                    <input type="text" readOnly={true} className="form-control" value={expireDateSixMonth}/>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <label htmlFor="inputValue1" className="col-sm-2 col-form-label1"></label>
                            <div className="col-sm-3" >
                            <button type="submit" className="btn btn-primary">KEY 정보 변경</button>
                            </div>
                            <div className="col-sm-3">
                            <button type="button" onClick={()=>{loginCheck()}} className="btn btn-danger">삭제</button>
                            </div>
                            </div>
                            <Modal open={modalOpen} close={closeModal} header="Confirm">
                                <main>{modalComment}</main>
                            </Modal>
                        </form>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default DefinitionForm;
import {useEffect, useState} from "react";
import { GetKey, Issue_key, keyDataInsert, KeyDefSave, KeyLog, Reissuance_key, KeyDataRefresh, Del_Issue_key} from "../../api/keyAPI";
import Swal from "sweetalert2"
import Modal from "../../common/modal";
import axios from "axios";
import Cookies from "js-cookie";

const KeyValueForm = ({keyListArr}) => {
    const setIp = 'https://192.168.0.4:5000'

    // 키 설정값 유지
    const [def, setDef] = useState('')

    // 키 값 유지
    const [inputValue, setInputValue] = useState('')
    const [submittedValue, setSubmittedValue] = useState('');

    // 모달 열기 및 내용 설정
    //const readID = JSON.parse(localStorage.getItem('user_id'))
    // const readID = JSON.parse(sessionStorage.getItem('user_data')).user_id
    const userDataId = Cookies.get('user_id');
    const readID = JSON.parse(decodeURIComponent(userDataId))
    const [fileData, setFileData] = useState(null)

    
    const handleTest = (e)=>{
        setInputValue(e.target.value)
    }

    // 초기 생성용 버튼클릭
    const handleButtonClick = ()=>{
        
            //setSubmittedValue(inputValue)
            const issueKey = {
                "user_id" : readID,
                "kek_password" : inputValue,
                "key_name" :def._id,
                "size" : def.size,
                "expire_date": def.expire_date,
                "data_type": def.data_type
            }
            Issue_key(issueKey).then(res=>{

            if(Object.keys(res) == "Upload Success"){
                const key = res["Upload Success"]
                Swal.fire("키 발급 완료",'','success')
                const blob = new Blob(["Private_key : ",key], {type:'application/octet-stream'})
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'secret_key.txt'
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
            }else if(res == "Invalid Password"){
                Swal.fire("비밀번호 형식 오류입니다", '','warning')
            }else if(res == "Server Error"){
                Swal.fire("추출기를 실행하세요",'','warning')
            }
            else if(res == "Blanked"){
                Swal.fire("키를 선택하세요", '','error')
            }
            else{
                Swal.fire("사용중인 키 이름입니다",'','warning')
            }
            clearFormFields()

        })
        GetKey(keySetting).then(key=>{
            // 표시용 key 값
            
            // DB 입력용 JSON 데이터 포맷 형성
            keyDataInsert({
                "_id" : def._id
            }).then(res=>{
                const log = {
                    "key_name": def._id,
                    "key_type": def.key_type,
                    "user_group":def.user_group,
                    "data_type":def.data_type,
                    "size":def.size,
                    "change_date":kort,
                    "issue_date":def.issue_date,
                    "requester":def.requester,
                    "expire_date":def.expire_date
                }
                KeyLog(log)
                clearFormFields()
            })
        })
        
    }    

    // 재발급용 버튼클릭
    const handleButtonClick2 = ()=>{
        //setSubmittedValue(inputValue)
        const reissueKey = {
                "user_id" : readID,
                "kek_password" : inputValue,
                "key_name" :def._id,
                "size" : def.size,
                "expire_date": def.expire_date,
                "data_type": def.data_type
            }            
        Reissuance_key(reissueKey).then(res=>{
            if(res == "KeyName Error"){
                Swal.fire("키를 생성해주세요.",'','error')
            }
            else if(res == "Wrong Password"){
                Swal.fire("비밀번호가 틀렸습니다.",'','warning')
            }else if(res == "Blanked"){
                Swal.fire("재발급할 키를 선택하세요", '', 'warning')
            }else {
                Swal.fire("재발급 완료",'','success')
                //setFileData(res)
                const blob = new Blob(["Private_key : ",res], {type:'application/octet-stream'})
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'secret_key(재발급).txt'
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                
            }
            clearFormFields()
                                
        })
        
    }
    const delete_key =() =>{
        const delInfo = {
            "key_name" :def._id,
        }
        Del_Issue_key(delInfo).then(res=>{
            alert(JSON.stringify(res))
            if(res == "deleted"){
                Swal.fire("키 삭제 완료", "삭제된 키 : "+ def._id,'info')
            }else if(res== "None"){
                Swal.fire("키를 생성 해주세요", '', 'error')
            }else if(res == "selected msg"){
                Swal.fire("키를 선택 해주세요", '', 'warning')
            }
        })
    }

    // setState 초기화 시 사용
    const handleDownload = ()=>{
        const blob = new Blob([fileData], {type:'application/octet-stream'})
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'secret_key.txt'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
    }
    // 다운로드 기능
    
      

    const key_data_refresh_click = () => {
        const userDataId = Cookies.get('user_id');
        const readID = JSON.parse(decodeURIComponent(userDataId));
        
        const requestData = {
            user_id: readID,
            key_name: def._id, 
        };

        KeyDataRefresh(requestData).then(res=>{
            
            if(res.form == "true") {
                Swal.fire(res.message,'','success')
            }else if (res.form == "false") {
                Swal.fire(res.message,'','warning')
            }
        })
        

    }
    

    // const key_data_refresh_click = () => {
    //     const userDataId = Cookies.get('user_id');
    //     const readID = JSON.parse(decodeURIComponent(userDataId));
    
        // const requestData = {
        //     user_id: readID,
        //     key_name: def._id, 
        // };
    
    //     axios.post("/key_data_refresh", requestData)
    //         .then(response => {
    //             console.log(response.data);
    //         })
    //         .catch(error => {
    //             console.error("Error refreshing key data:", error);
    //         });
    // };
    


    const clearFormFields = () => {
        document.getElementById("kek_password").value = "";
        };

    // 리스트에서 key 목록 선택 기능
    const handleChange = (e) => {
        // const keyNamePost = {"key_name": e.target.value}
        const keyNamePost = {"_id": e.target.value}
        postDefData(keyNamePost)
    };

    // 데이터를 전송하는 기능능
   const postDefData = (post) => {
        KeyDefSave(post).then(data => {
            setDef(data)
        })
    }
    const blockChange =(event)=>{
        event.preventDefault();
        event.stopPropagation();
    }

    // 시간포맷 변경 기능
    const offset= 1000*60 *60 *9
    const kortime = new Date((new Date()).getTime()+offset)
    const kort = kortime.toISOString().replace("T", " ").split('.')[0]

        

    // key Data DB 저장용 포멧 변경
    const keySetting ={
        "data_type":def.data_type,
        "size":def.size,
        "_id":def._id
    }

    

    return (
        <div className="container-fluid pt-4 px-4">
            <div className="row g-4">
                <div className="col-sm-12 col-xl-4">

                    <div className="bg-light rounded h-100 p-4">
                        <h6 className="mb-4">발급 키 목록</h6>
                        <form>
                            <div className="mb-3">
                                <select className="form-select" size="10" onChange={handleChange}
                                        defaultValue={"5"}>
                                    {keyListArr && keyListArr.map(((key, idx) => <option
                                            key={key}>{keyListArr[idx]}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="row mb-3"/>
                                <div className="d-grid gap-2 d-md-flex justify-content-md-end" >
                                    <button type="button" className="btn btn-danger me-md-2" onClick={delete_key} >키삭제</button>
                            </div>      
                        </form>
                    </div>
                </div>
                <div className="col-sm-12 col-xl-8">
                    <div className="bg-light rounded h-100 p-4">
                        <h6 className="mb-4">키 생성</h6>
                        <form>
                            <div className="row mb-3">
                                <label htmlFor="inputUserGroup"
                                       className="col-sm-2 col-form-label">사용 용도</label>
                                <div className="col-sm-10">
                                    <input readOnly={true} className="form-control" aria-label="Input User Group"
                                            defaultValue={def.user_group} key={def._id} id="user_group">
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
                                <label htmlFor="inputValue" className="col-sm-2 col-form-label">암호화키</label>
                                <div className="col-sm-10">
                                        <textarea readOnly={true} className="form-control" aria-label="With textarea"
                                               onChange={()=>dummyChange()} style={{height:"150px"}}    key={def.key_name}/>
                                </div>
                            </div> */}
                            
                           
                            <div className="row mb-3">
                                <label htmlFor="inputDataType" className="col-sm-2 col-form-label">키 타입</label>
                                <div className="col-sm-10">
                                    <input readOnly={true} className="form-control" aria-label="Default select example"
                                            defaultValue={def.data_type} key={def._id} id="data_type">
                                    </input>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <label htmlFor="inputSize" className="col-sm-2 col-form-label">키 길이</label>
                                <div className="col-sm-10">
                                    <input readOnly={true} type="number" max={1024} className="form-control" id="size"
                                           defaultValue={def.size} key={def._id}>
                                    </input>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <label htmlFor="inputIssueDate"
                                       className="col-sm-2 col-form-label">발급일</label>
                                <div className="col-sm-10">
                                    <input readOnly={true} type="text" className="form-control" id="issue_date"
                                           defaultValue={def.issue_date} key={def._id}>
                                    </input>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <label htmlFor="inputRequester"
                                       className="col-sm-2 col-form-label">키 관리자</label>
                                <div className="col-sm-10">
                                    <input readOnly={true} type="text" className="form-control" id="requester"
                                           defaultValue={def.requester} key={def._id}>
                                    </input>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <label htmlFor="inputExpireDate"
                                       className="col-sm-2 col-form-label">키 만료일</label>
                                <div className="col-sm-10">
                                    <input readOnly={true} type="text" className="form-control" id="inputExpireDate"
                                           defaultValue={def.expire_date} key={def._id}>
                                    </input>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <label htmlFor="inputKekPassword" className="col-sm-2 col-form-label">발급 비밀번호</label>
                                <div className="col-sm-10" >
                                    <input type="password" className="form-control" id="kek_password" placeholder="4자리 이상 13자리 이하 비밀번호" onChange={handleTest} value={inputValue } /> 

                                </div>
                            </div>
                            <div className="row mb-3"/>
                                <div className="d-grid gap-2 d-md-flex justify-content-md-end" >
                                    <button type="button" className="btn btn-primary me-md-2" onClick={()=>{handleButtonClick(keySetting)}} >키생성</button>
                                </div>
                            <div className="row mb-3"/>
                                <div className="d-grid gap-2 d-md-flex justify-content-md-end" >
                                    <button type="button" className="btn btn-primary me-md-2" onClick={handleButtonClick2} >재발급</button>
                                </div>
                            {/* <div className="row mb-3"/>
                                <div className="d-grid gap-2 d-md-flex justify-content-md-end" >
                                    <button type="button" className="btn btn-primary me-md-2" onClick={handleDownload} >다운로드</button>
                                </div> */}

                            <div className="row mb-3"/>
                                <div className="d-grid gap-2 d-md-flex justify-content-md-end" >
                                    <button type="button" className="btn btn-primary me-md-2" onClick={key_data_refresh_click} >키갱신</button>
                            </div>
                                 
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default KeyValueForm;



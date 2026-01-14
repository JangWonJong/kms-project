import React, {useContext, useState} from 'react';
import {KeyLogContext} from "./key_manage";
import Pagination from "./pagination";
import Modal from "../../common/modal";

const LogPage = ({keyLogListArr,search, setCurrentView, changeFlag}) => {

    // 모달 열기 및 내용
    const [modalOpen, setModalOpen] = useState(false);
    const [modalComment, setModalComment] = useState('');

    // 페이지 네이션
    const {offset, limit} = useContext(KeyLogContext)

    // 모달 열고 닫기
    const openModal = () => {
        setModalOpen(true);
    };
    const closeModal = () => {
        setModalOpen(false);
    };

    if (!keyLogListArr) {
        alert("인증이 유효하지않습니다, 다시 로그인해주세요.")
        setCurrentView('Login');
        return <div>인증 에러</div>;
    }

    // // 모달을 이용한 key 값 표시 기능
    // const showKey =(keyData)=>{
    //     setModalComment(keyData)
    //     openModal()
    // }
    // const handelSubmit = (e) => {
    //     const target = e.target
    //     e.preventDefault();
    //     search(target.search_data.value)
    //     ``
    // }
    
    return (
        <>
            <div className="container-fluid pt-4 px-4">
                <div className="bg-light text-center rounded p-4">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        {/*<form className="d-none d-md-flex ms-4" onSubmit={handelSubmit}>*/}
                        {/*    <input className="form-control border-0" id="search_data" type="search" placeholder="Search"/>*/}
                        {/*    <button className="form-control" type={"submit"}>Search</button>*/}
                        {/*</form>*/}
                    </div>
                    <div className="table-responsive" style={{width:'auto'}} >
                        <table className="table text-start align-middle table-bordered table-hover mb-0" >
                            <thead>
                            <tr className="text-dark">
                                <th scope="col">키 이름</th>
                                {/*<th scope="col">Key&nbsp;Type</th>*/}
                                <th scope="col">용도</th>
                                {/*<th scope="col" style={{textAlign:'center'}}>EndPoint</th>*/}
                                  <th scope="col">키 타입</th>
                                <th scope="col">키 길이</th>
                                <th scope="col">키 관리자</th>
                                <th scope="col">발급일</th>
                                <th scope="col">만료일</th>
                                {/* <th scope="col" style={{textAlign:'center'}}>암호화키</th> */}
                                <th scope="col">변경 일자</th>
                            </tr>
                            </thead>
                            <tbody>
                            {keyLogListArr && keyLogListArr.slice(offset, offset + limit).map((data, idx) => (
                                <React.Fragment key={idx}>
                                    <tr>
                                        <td>{data.key_name}</td>
                                        {/*<td>{data.key_type}</td>*/}
                                        <td>{data.user_group}</td>
                                        {/*<td>{data.end_point}</td>*/}
                                        <td>{data.data_type}</td>
                                        <td>{data.size}</td>
                                        <td>{data.requester}</td>
                                        <td>{data.issue_date}</td>
                                        <td>{data.expire_date}</td>
                                        {/* <td><button type={"button"} className="btn btn-primary" onClick={()=>{showKey(data.key_value)}}>Key</button></td> */}
                                        <td>{data.change_date}</td>
                                    </tr>
                                </React.Fragment>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination total={keyLogListArr.length}></Pagination>
                    <Modal open={modalOpen} close={closeModal} header="Confirm">
                        <main>{modalComment}</main>
                    </Modal>
                </div>
            </div>
        </>
    );
};

export default LogPage;
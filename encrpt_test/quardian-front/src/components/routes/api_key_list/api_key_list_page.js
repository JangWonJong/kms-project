import React from 'react';
import {useContext, useState} from "react";
import {ApiKeyLogContext} from "./api_key";
import Modal from "../../common/modal";
import ApiPagination from "./api_pagination";
import {DeleteApi} from "../../api/keyAPI";



const ApiKeyListPage = ({ApiKeyLogListArr,search,changeFlag}) => {
    // 모달 관련 부분
    const [modalOpen, setModalOpen] = useState(false);
    const [modalComment, setModalComment] = useState('');

    const {offset, limit,apiPageNum} = useContext(ApiKeyLogContext)

    const openModal = () => {
        setModalOpen(true);
    };
    const closeModal = () => {
        setModalOpen(false);
    };

    // 모달 내용 입력
    const showKey =(keyData)=>{
        setModalComment(keyData)
        openModal()
    }
    // 데이터 제출 처리 기능
    const handelSubmit = (e) => {
        const target = e.target
        e.preventDefault();
        search(target.search_data.value)
    }

    // 삭제 처리 기능
    const handleDelete = (key_data)=>{
        DeleteApi(key_data).then(res=>{
            changeFlag()
        })
    }

    return (
        <>
            <div className="container-fluid pt-4 px-4">
                <div className="bg-light text-center rounded p-4">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <form className="d-none d-md-flex ms-4" onSubmit={handelSubmit}>
                            <input className="form-control border-0" id="search_data" type="search" placeholder="Search"/>
                            <button className="form-control" type={"submit"}>Search</button>
                        </form>
                        <button type={"button"} className="btn btn-primary" disabled={true}>PAGE {apiPageNum}</button>
                    </div>
                    <div className="table-responsive" style={{width:'auto'}} >

                        <table className="table text-start align-middle table-bordered table-hover mb-0" >

                            <thead>
                            <tr className="text-dark">
                                {/*<th scope="col">No</th>*/}
                                <th scope="col" style={{textAlign:'center'}}>Key</th>
                                <th scope="col">Data&nbsp;Type</th>
                                <th scope="col">Size</th>
                                <th scope="col">Issue&nbsp;Date</th>
                                <th scope="col">Expire&nbsp;Date</th>
                                <th scope="col" style={{textAlign:'center'}}>Delete&nbsp;Key</th>
                            </tr>
                            </thead>
                            <tbody>
                            {ApiKeyLogListArr && ApiKeyLogListArr.slice(offset, offset + limit).map((data, idx) => (
                                <React.Fragment key={idx}>
                                    <tr>
                                        {/*<td>{data.kno}</td>*/}
                                        <td style={{textAlign:'center'}} ><button type={"button"} className="btn btn-primary" onClick={()=>{showKey(data._id)}}>Key</button></td>
                                        <td>{data.key_type}</td>
                                        <td>{data.key_size}</td>
                                        <td>{data.issue_date}</td>
                                        <td>{data.kst_expire_date}</td>
                                        <td style={{textAlign:'center'}}><button  className={"btn btn-danger"} type={"button"} onClick={()=>{handleDelete(data._id)}}>Delete</button></td>
                                    </tr>
                                </React.Fragment>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <ApiPagination total={ApiKeyLogListArr.length}></ApiPagination>
                    <Modal open={modalOpen} close={closeModal} header="Confirm">
                        <main>{modalComment}</main>
                    </Modal>
                </div>
            </div>
        </>
    );
};

export default ApiKeyListPage;
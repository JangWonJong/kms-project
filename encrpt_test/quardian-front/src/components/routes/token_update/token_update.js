import React, {useEffect} from 'react';
import {ChangeToken, DeleteToken, GetApiKeys2, GetKeyLog, GetTokenList, MakeToken} from "../../api/keyAPI";
import Modal from "../../common/modal";
import {useState} from "react";
import Pagination from "../key_log/pagination";
import Token_list_pagination from "./token_list_pagination";

const TokenUpdate = () => {
    // 인증 토큰 업데이트 페이지 미완성 mongoDB용으로 다시 개발 해야 함

    const [modalOpen, setModalOpen] = useState(false);
    const [modalComment, setModalComment] = useState('');
    const [keyLogListArr, setKeyLogListArr] = useState([])
    const [flag,setFlag]=useState(false);

    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const offset = (page - 1) * limit;

    let arr = []
    const openModal = () => {
        setModalOpen(true);
    };
    const closeModal = () => {
        setModalOpen(false);
    };
    useEffect(()=>{
        GetTokenList().then(res=>{
            arr = (res.data)
            setKeyLogListArr(arr)
        })
    },[flag])
    const makeToken=()=>{
        MakeToken().then(res=>{
            setFlag(!flag)
        })
    };

    const handleDelete=(tokenData)=>{
        DeleteToken(tokenData).then(res=>{
            setFlag(!flag)
        })
    }
    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     const ogToken = e.target.originalToken.value
    //     const changeToken = e.target.changeToken.value
    //     const tokenData = {
    //         "bearer_token": changeToken
    //     }
    //     ChangeToken(tokenData, ogToken).then(res => {
    //         if (Object.keys(res)[0]==="error") {
    //             setModalComment("Token Change Failed \n Please check Original Token")
    //         } else {
    //             setModalComment("Token Change Success")
    //         }
    //         openModal(modalComment)
    //     })
    // }
    return (
        <>
            <div className="container-fluid pt-4 px-4">
                <div className="bg-light text-center rounded p-4">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <button className={'btn-primary'} onClick={()=>{makeToken()}}>Get Token</button>
                    </div>
                    <div className="table-responsive" style={{width:'auto'}} >
                        <table className="table text-start align-middle table-bordered table-hover mb-0" >
                            <thead>
                            <tr className="text-dark">
                                <th scope="col">Bearer&nbsp;Token</th>
                                {/*<th scope="col" style={{textAlign:'center'}}>Delete&nbsp;Key</th>*/}
                            </tr>
                            </thead>
                            <tbody>
                            {keyLogListArr && keyLogListArr.slice(offset, offset + limit).map((data, idx) => (
                                <React.Fragment key={idx}>
                                    <tr>
                                        <td>{data.token}</td>
                                        {/*<td style={{textAlign:'center'}}><button  className={"btn btn-danger"} type={"button"} onClick={()=>{handleDelete(data.token)}}>Delete</button></td>*/}
                                    </tr>
                                </React.Fragment>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <Token_list_pagination total={keyLogListArr.length} limit={limit} setPage={setPage} page={page}></Token_list_pagination>
                    <Modal open={modalOpen} close={closeModal} header="Confirm">
                        <main>{modalComment}</main>
                    </Modal>
                </div>
            </div>
        </>
    );
};

export default TokenUpdate;
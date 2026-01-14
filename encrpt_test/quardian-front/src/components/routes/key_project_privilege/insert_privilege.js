import React from 'react';
import {PrivilegeInsert, PrivilegeList} from "../../api/keyAPI";
import {useEffect, useState} from "react";


const InsertPrivilege = ({getClick}) => {


    // Privilege 페이지는 추후 계정 관련 부분에 사용됨
    // 현재 개발 미완료
    const [privilegeListArr, setPrivilegeListArr] = useState('')
    const [flag, setFlag] = useState(false)

    let arr = []

    useEffect(()=>{
        PrivilegeList().then(res=>{
            arr = (res.data.map(row => row.proj_name))
            setPrivilegeListArr(arr)
        })
    },[flag])

    const handelSubmit = (e) => {
        e.preventDefault();
        const prvJson = {
            "proj_name": e.target.proj_name.value,
            "description":e.target.description.value,
            "start_date":e.target.start_date.value,
            "active":e.target.active.value,
            "expire_date":e.target.expire_date.value,
        }

        PrivilegeInsert(prvJson).then(res=>{
            setFlag(!flag)
            getClick("ProjectPrivilege")
        })
    }
    return (
        <div className="container-fluid pt-4 px-4">
            <div className="row g-4">
                <div className="col-sm-12 col-xl-4">
                    <div className="bg-light rounded h-100 p-4">
                        <h6 className="mb-4">Project Privilege List</h6>
                        <form>
                            <div className="mb-3">
                                <select className="form-select" size="10" disabled={true}>
                                    {privilegeListArr && privilegeListArr.map(((key,idx) => <option
                                            key={key}>{privilegeListArr[idx]}</option>
                                    ))}
                                </select>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="col-sm-12 col-xl-8">
                    <div className="bg-light rounded h-100 p-4">
                        <h6 className="mb-4">Project Privilege</h6>
                        <form onSubmit={handelSubmit}>

                            <div className="row mb-3">
                                <label htmlFor="inputProjectName"
                                       className="col-sm-2 col-form-label">ProjectName</label>
                                <div className="col-sm-10">
                                    <input type="text" className="form-control" id="proj_name">
                                    </input>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <label htmlFor="inputValue" className="col-sm-2 col-form-label">Description</label>
                                <div className="col-sm-10">
                                        <textarea className="form-control" aria-label="With textarea" id="description"></textarea>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <label htmlFor="inputIssueDate" className="col-sm-2 col-form-label">StartDate</label>
                                <div className="col-sm-10">
                                    <input type="text" className="form-control" id="start_date">
                                    </input>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <label htmlFor="inputActive" className="col-sm-2 col-form-label">Active</label>
                                <div className="col-sm-10">
                                    <input type="text" className="form-control" id="active">
                                    </input>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <label htmlFor="inputExpireDAte" className="col-sm-2 col-form-label">ExpireDAte</label>
                                <div className="col-sm-10">
                                    <input type="text" className="form-control" id="expire_date">
                                    </input>
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

export default InsertPrivilege;
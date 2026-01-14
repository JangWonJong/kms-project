import React from 'react';
import PrvInsertButton from "./prv_insert_button";
import {PrivilegeSave, PrivilegeUpdate} from "../../api/keyAPI";
import {useState} from "react";

const PrivilegeForm = ({setCurrentView,privilegeListArr}) => {
    const [prv, serPrv] = useState('')
    const handleChange = (e) => {
        const keyNamePost = {"proj_name": e.target.value}
        postDefData(keyNamePost)
    };

    const postDefData = (post) => {
        PrivilegeSave(post).then(data => {
            serPrv(data)
        })
    }

    const handelSubmit = (e) => {
        e.preventDefault();

        const prvJson = {
            "proj_name": e.target.proj_name.value,
            "description":e.target.description.value,
            "start_date":e.target.start_date.value,
            "active":e.target.active.value,
            "expire_date":e.target.expire_date.value,
        }

        PrivilegeUpdate(prvJson).then(res=>{

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

                                <select className="form-select" size="10" onChange={handleChange} >
                                    {privilegeListArr && privilegeListArr.map(((key,idx) => <option
                                            key={key}>{privilegeListArr[idx]}</option>
                                    ))}
                                </select>

                            </div>


                            <PrvInsertButton setCurrentView={setCurrentView}/>

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
                                    <input type="text" className="form-control" id="proj_name"
                                           defaultValue={prv.proj_name} key={prv.proj_name}>
                                    </input>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <label htmlFor="inputValue" className="col-sm-2 col-form-label">Description</label>
                                <div className="col-sm-10">
                                        <textarea className="form-control" aria-label="With textarea" id="description"
                                                  defaultValue={prv.description} key={prv.proj_name}></textarea>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <label htmlFor="inputIssueDate" className="col-sm-2 col-form-label">StartDate</label>
                                <div className="col-sm-10">
                                    <input type="text" className="form-control" id="start_date"
                                           defaultValue={prv.start_date} key={prv.proj_name}>
                                    </input>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <label htmlFor="inputActive" className="col-sm-2 col-form-label">Active</label>
                                <div className="col-sm-10">
                                    <input type="text" className="form-control" id="active"
                                           defaultValue={prv.active} key={prv.proj_name}>
                                    </input>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <label htmlFor="inputExpireDate" className="col-sm-2 col-form-label">ExpireDate</label>
                                <div className="col-sm-10">
                                    <input type="text" className="form-control" id="expire_date"
                                           defaultValue={prv.expire_date} key={prv.proj_name}>
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

export default PrivilegeForm;
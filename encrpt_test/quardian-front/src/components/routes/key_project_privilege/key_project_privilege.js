import React from 'react';
import PrivilegeForm from "./privilege_form";
import {useEffect, useState} from "react";
import {PrivilegeList} from "../../api/keyAPI";


const KeyProjectPrivilege = ({setCurrentView}) => {

    const [privilegeListArr, setPrivilegeListArr] = useState('')

    let arr = []

    useEffect(()=>{
        PrivilegeList().then(res=>{
            arr = (res.data.map(row => row.proj_name))
            setPrivilegeListArr(arr)
        })
    },[])

    return (
        <div>
            <PrivilegeForm setCurrentView={setCurrentView} privilegeListArr={privilegeListArr}></PrivilegeForm>
        </div>
    );
};

export default KeyProjectPrivilege;
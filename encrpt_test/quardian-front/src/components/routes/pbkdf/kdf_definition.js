import React from 'react';
import {useEffect, useState} from "react";
import KdfForm from './kdf_form';

const KdfDefinition = ({setCurrentView}) => {

    // 키 목록 유지
    const [keyListArr, setKeyListArr] = useState('')

    // 화면 갱신 기능
    const [flag,setFlag] =useState(true)
    let arr = []

    // 화면 갱신 기능
    const changeFlag = () =>{
        setFlag(!flag)
    }

    // useEffect 사용한 첫 화면 데이터 불러오기 기능
    useEffect(()=>{}
      )
    return (
        <>
            <KdfForm keyListArr={keyListArr} changeFlag={changeFlag} setCurrentView={setCurrentView}></KdfForm>
        </>
    );
};

export default KdfDefinition;
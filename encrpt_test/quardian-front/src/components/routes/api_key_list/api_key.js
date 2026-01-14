import React from 'react';
import {createContext, useEffect, useState} from 'react';
import {GetApiKeys, GetApiKeys2, GetKeyLog, SearchAPI} from "../../api/keyAPI";
import ApiKeyListPage from "./api_key_list_page";

export const ApiKeyLogContext = createContext()
const ApiKey = ({setCurrentView}) => {
    const [ApiKeyLogListArr, setApiKeyLogListArr] = useState([])

    // 화면 갱신
    const [flag,setFlag] =useState(true)


    // 페이지네이션
    const [apiPageNum,setApiPageNum] = useState(1);
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const offset = (page - 1) * limit;

    let arr = []

    // 화면 갱신 기능
    const changeFlag = () =>{
        setFlag(!flag)
    }

    // 검색 기능
    const search = (word) =>{
        let bytesWord = word
        let wordResult = {"key_data":bytesWord}
        SearchAPI(wordResult).then(res=>{
            arr = (res.data)
            setApiKeyLogListArr(arr)
            setPage(1)
    })
    }
    // useEffect 사용하여 기본 화면 출력 설정
    // API 로그 리스트 불러옴
    useEffect(()=>{
        GetApiKeys2(apiPageNum).then(res=>{
            arr = (res.data)
            setApiKeyLogListArr(arr)
            setPage(1)
        })
    },[apiPageNum,flag])

    return (
        <div>
            <ApiKeyLogContext.Provider value={{limit,page,offset,setPage,apiPageNum,setApiPageNum}}>
                <ApiKeyListPage ApiKeyLogListArr={ApiKeyLogListArr} search={search} changeFlag={changeFlag} setCurrentView={setCurrentView}></ApiKeyListPage>
            </ApiKeyLogContext.Provider>
        </div>
    );
};

export default ApiKey;
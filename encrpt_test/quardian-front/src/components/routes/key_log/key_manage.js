import React, {createContext, useEffect, useState} from 'react';
import {GetKeyLog, KeyList, KMSSearchAPI, SearchAPI} from "../../api/keyAPI";
import DefinitionForm from "../key_definition/definition_form";
import LogPage from "./log_page";
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';

export const KeyLogContext = createContext()

const KeyManage = ({setCurrentView}) => {
    const setIp = 'https://192.168.0.4:5000'

    const [ApiKeyLogListArr, setApiKeyLogListArr] = useState([])

    // 키 목록 유지
    const [keyLogListArr, setKeyLogListArr] = useState([])

    // 화면 갱신
    const [flag,setFlag] =useState(true)

    // 페이지 네이션 부분
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
        // let bytesWord = word.replaceAll("\\","\\\\")
        let bytesWord = word
        let wordResult = {"key_data":bytesWord}
        KMSSearchAPI(wordResult).then(res=>{
            arr = (res.data)
            setApiKeyLogListArr(arr)
            setPage(1)
        })
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
                    // useEffect 사용한 페이지 데이터 로딩 기능
                    GetKeyLog().then(res=>{
                        arr = (res.data)
                        setKeyLogListArr(arr)
                    })
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

    useEffect(() => {
        loginCheck();
      }, []);

    return (
        <>
            <KeyLogContext.Provider value={{limit,page,offset,setPage}}>
            <LogPage keyLogListArr={keyLogListArr} changeFlag={changeFlag} search={search} setCurrentView={setCurrentView}></LogPage>
            </KeyLogContext.Provider>
        </>
    );
};

export default KeyManage;
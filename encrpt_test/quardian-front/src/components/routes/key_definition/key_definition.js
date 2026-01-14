import React from 'react';
import DefinitionForm from "./definition_form";
import {useEffect, useState} from "react";
import {KeyList} from "../../api/keyAPI";
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';


const KeyDefinition = ({setCurrentView}) => {
  
    const setIp = 'https://192.168.0.4:5000'
    // 키 목록 유지
    const [keyListArr, setKeyListArr] = useState('')

    // 화면 갱신 기능
    const [flag,setFlag] =useState(true)
    let arr = []

    // 화면 갱신 기능
    const changeFlag = () =>{
        setFlag(!flag)
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
                    KeyList().then(res => {
                      if (res && res.data && Array.isArray(res.data)) {
                          arr = res.data.map(row => row._id);
                          setKeyListArr(arr);
                      } else {
                          console.error("Invalid response data format:", res);
                          Swal.fire(res.message)
                          setCurrentView('Login');
                      }
                  }).catch(error => {
                      console.error("Error fetching key list:", error);
                      Swal.fire("인증이 유효하지 않습니다, 다시 로그인해주세요.")
                      setCurrentView('Login');
                  });
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
      }, [flag]);

    return (
        <>
            <DefinitionForm keyListArr={keyListArr} changeFlag={changeFlag} setCurrentView={setCurrentView}></DefinitionForm>
        </>
    );
};

export default KeyDefinition;
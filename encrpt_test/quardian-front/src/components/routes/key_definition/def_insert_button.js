import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { Button } from "react-bootstrap";
import Swal from 'sweetalert2';

const DefInsertButton = ({setCurrentView}) => {
    // insert 버튼용 컴포넌트 페이지
    const setIp = 'https://192.168.0.4:5000'

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
                    setCurrentView("InsertDefinition")
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

    return (
        <>
            <Button type="button" className="btn btn-primary" onClick={() => loginCheck()}>
                새로운 키 생성</Button>
        </>
    )
}

export default DefInsertButton
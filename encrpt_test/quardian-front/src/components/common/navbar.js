
// import React, {useState} from "react";

import Swal from 'sweetalert2';

import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
const NavBar =({setCurrentView,sidebarChange,getClick})=>{
    // 모달 상태 유지
    const [isOpen, setIsOpen] = useState(false);
    const [loginData, setLoginData] = useState({ user_id: null });
    const setIp = 'https://192.168.0.4:5000'

    useEffect(() => {
        const userDataId = Cookies.get('user_id');
        const parsedLoginData = userDataId ? { user_id: JSON.parse(decodeURIComponent(userDataId))} : { user_id: null };
        setLoginData(parsedLoginData);
      }, []);
    
    // 상단바 드롭다운 기능
    const dropdownClicked = () => {
        setIsOpen(!isOpen)
    }

    // 상단바 열렸을시 다른 부분 클릭시 닫히게 하는 기능
    const preventFocusMove = (event) => {
        event.preventDefault();
    }

    const onLogout = () => {
      fetch( setIp + '/logout_user', {
      //fetch('https://localhost:5000/logout_user', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })
        Swal.fire("로그아웃")
        setCurrentView('Login');
        setLoginData({ user_id: null });
      };


    const loginDiv = () => {
        const userData = Cookies.get('user_id');
        if (!userData) {
          return <a href="#" className="dropdown-item" onClick={() => setCurrentView('Login')}>Log In</a>;
        } else {
          try {
            return <a href="#" className="dropdown-item" onClick={onLogout}>Log Out</a>;
          } catch (error) {
            console.log('Invalid user_data cookie:', error);
            return null;
          }
        }
      };

    const register = () => {
        const userData = Cookies.get('user_id');
        if (!userData) {
          return null;
        } else {
          try {
            return <a href="#" className="dropdown-item" onClick={() => setCurrentView('PasswordSetting')}>Setting</a>;
          } catch (error) {
            console.log('Invalid user_data cookie:', error);
            return null;
          }
        }
      };

    return (
            <nav className="navbar navbar-expand bg-light navbar-light sticky-top px-4 py-0">
                <a href="index.html" className="navbar-brand d-flex d-lg-none me-4">
                    <h2 className="text-primary mb-0"><i className="fa fa-hashtag"></i></h2>
                </a>
                <div className="navbar-nav align-items-center ms-auto">
                    <div className="nav-item dropdown">
                        <a  href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown" onBlur={dropdownClicked} onClick={()=>{dropdownClicked()}}>
                            <span className="d-none d-lg-inline-flex">{loginData.user_id ? loginData.user_id : 'LogIn'}</span>
                            
                        </a>

                        <div className={`dropdown-menu dropdown-menu-end bg-light border-0 rounded-0 rounded-bottom m-0${isOpen ? ' show' : ''}`} onMouseDown={preventFocusMove}>
                            {register()}
                            {loginDiv()}
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

export default NavBar;
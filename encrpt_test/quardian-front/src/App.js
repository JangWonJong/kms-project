import React, {useEffect, useState} from 'react';
import './css/bootstrap.min.css';
import './css/style.css';

import Header from "./components/common/header";
import Sidebar from "./components/common/sidebar";
import NavBar from "./components/common/navbar";
import Footer from "./components/common/footer";

import KeyProjectPrivilege from "./components/routes/key_project_privilege/key_project_privilege";
import KeyDefinition from "./components/routes/key_definition/key_definition";
import KeyManagement from "./components/routes/key_value/key_management";
import InsertDefinition from "./components/routes/key_definition/insert_definition";
import InsertPrivilege from "./components/routes/key_project_privilege/insert_privilege";
import Login from "./components/routes/register/login/login";
import PasswordSetting from "./components/routes/register/login/setting";
import LogPage from "./components/routes/key_log/log_page";
import KeyManage from "./components/routes/key_log/key_manage";
import QuardianChart from "./components/routes/key_charts/quardian_chart";
import ApiKey from "./components/routes/api_key_list/api_key";
import ApiKeyCreate from "./components/routes/api_key_create/api_key_create";
import TokenUpdate from "./components/routes/token_update/token_update";
import PbkdfCreate from './components/routes/pbkdf/pbkdf_create';
import Register from "./components/routes/register/login/register"
import KMSChart from "./components/routes/key_charts/kms_chart";
import OTPChart from "./components/routes/key_charts/otp_chart";


import TestManagement from './components/routes/key_value/test_management';

import Cookies from 'js-cookie';
import Swal from 'sweetalert2'

const App = () => {
    const [currentView, setCurrentView] = useState('Login')
    const [openSidebar, setOpenSidebar] = useState(false)
    const [currentClick, setCurrentClick] = useState('KMSChart');
    const [loginData, setLoginData] = useState('');

    const setIp = 'https://192.168.0.4:5000'
    const getClick = (e) => {
        setCurrentClick(e)
        setCurrentView(e)
    };
    const sidebarChange = () => {
        setOpenSidebar(!openSidebar)
    }

    const loginCheck = () => {

        const userDataCookie = localStorage.getItem('user_data');
        if (userDataCookie) {


        const userData = Cookies.get('user_id');
        if (userData) {
          try {
            const userId = userData
            fetch( setIp +'/decode_token', {
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
                  setCurrentView('KMSChart');
                } else {
                  // console.error('Token is not valid:', data.error);
                  setCurrentView('Login');
                }
              })
              .catch((error) => {
                // console.error('Error verifying token:', error);
                setCurrentView('Login');
              });
          } catch (error) {
            // console.error('Error parsing user data:', error);
            setCurrentView('Login');
          }
        } else {
          setCurrentView('Login');
        }
      };

    }



    useEffect(() => {
        loginCheck();
      }, []);


    const mainPage = () => {
        if (currentView === "Login") {
            return  <Login setCurrentView={setCurrentView} getClick={getClick} setLoginData={setLoginData}/>
        }
        if (currentView === "PasswordSetting") {
            return <PasswordSetting setCurrentView={setCurrentView} loginData={loginData} setLoginData={setLoginData}></PasswordSetting>

        }
        if (currentView === "Register") {
            return  <Register setCurrentView={setCurrentView} getClick={getClick} setLoginData={setLoginData}/>
        }else
            return <>
                <Header></Header>
                <meta charSet="utf-8"/>
                <title>BASESTONE</title>
                <div className={"container-xxl position-relative bg-white d-flex p-0"}>
                {/*<div className={"container-xxl position-relative bg-white d-flex p-0"}>*/}
                    <Sidebar openSidebar={openSidebar} currentClick={currentClick} getClick={getClick} loginData={loginData}/>
                    <div className={`content ${openSidebar ? ' open' : ''}`}>
                        <NavBar setCurrentView={setCurrentView} sidebarChange={sidebarChange} getClick={getClick}
                                loginData={loginData} setLoginData={setLoginData} ></NavBar>
                        {currentView === "KeyDefinition" && <KeyDefinition setCurrentView={setCurrentView}/>}
                        {currentView === "InsertDefinition" && <InsertDefinition getClick={getClick}/>}
                        {currentView === "KeyManagement" && <KeyManagement setCurrentView={setCurrentView}/>}
                        {currentView === "ProjectPrivilege" && <KeyProjectPrivilege setCurrentView={setCurrentView}/>}
                        {currentView === "InsertPrivilege" && <InsertPrivilege getClick={getClick}/>}
                        {currentView === "KeyLog" && <KeyManage getClick={getClick} setCurrentView={setCurrentView}/>}
                        {currentView === "DashBoard" && <KMSChart getClick={getClick} setCurrentView={setCurrentView}/>}
                        {currentView === "KMSChart" && <KMSChart getClick={getClick} setCurrentView={setCurrentView}/>} 
                        {currentView === "OTPChart" && <OTPChart getClick={getClick} setCurrentView={setCurrentView}/>}
                        {currentView === "ApiKey" && <ApiKey getClick={getClick} setCurrentView={setCurrentView}/>}
                        {currentView === "ApiKeyCreate" && <ApiKeyCreate getClick={getClick} setCurrentView={setCurrentView}/>}
                        {currentView === "TokenUpdate" && <TokenUpdate getClick={getClick} setCurrentView={setCurrentView}/>}
                        {currentView === "PbkdfCreate" && <PbkdfCreate getClick={getClick} setCurrentView={setCurrentView}/>}


                       

                        {currentView === "LogPage" && <LogPage getClick={getClick} setCurrentView={setCurrentView}/>}
                        <Footer></Footer>
                    </div>
                </div>
                <a href="#" className="btn btn-lg btn-primary btn-lg-square back-to-top"><i
                    className="bi bi-arrow-up" onClick={() => {
                    window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
                }}></i></a>
            </>
    }
    return (
        mainPage()
    );
}
export default App;

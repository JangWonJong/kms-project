// import React, {Component} from 'react';
import React, { useEffect, useState } from 'react';
import ApiKey from "../routes/api_key_list/api_key";
import Cookies from 'js-cookie';

const SideBar = ({openSidebar,currentClick,getClick}) => {
    const [loginData, setLoginData] = useState({ user_id: null });

    useEffect(() => {
        const userDataId = Cookies.get('user_id');
        const parsedLoginData = userDataId ? { user_id: JSON.parse(decodeURIComponent(userDataId))} : { user_id: null };
        setLoginData(parsedLoginData);
      }, []);
  

        // 메인 화면으로 이동하는 기능
        const keyDefinitionView = ()=>{
            getClick("KMSChart")
        }

        return (
            <div className={`sidebar pe-4 pb-3${openSidebar ? ' open' : ''}`}>
                <nav className="navbar bg-light navbar-light">
                    <a href="#" onClick={()=>{keyDefinitionView()}} className="navbar-brand mx-4 mb-3">
                        <h4 className="text-primary">BASESTONE</h4>
                    </a>
                    <div className="d-flex align-items-center ms-4 mb-4">
                        {/*로그인 상태일 시 유저 아이디 표시 기능*/}
                        <div className="ms-3">
                            {/* <h6 className="mb-0">{loginData===''? "비로그인" : loginData.user_id}</h6> */}
                            <h6 className="mb-0">{loginData.user_id !== null ? loginData.user_id : 'non-login'}</h6>
                            
                        </div>
                    </div>
                    {/*사이드바에 이동 가능한 탭 추가하는 부분*/}
                    <div className="navbar-nav w-100">
                        <a href="#"  className={"nav-item nav-link"+(currentClick==="KMSChart"? ' active':'')} id="KMSChart" onClick={() => getClick("KMSChart")}>
                            <i className="fa fa-th me-2"></i>DashBoard</a>

                        <a href="#"  className={"nav-item nav-link"+(currentClick==="KeyDefinition"? ' active':'')} id="KeyDefinition" onClick={() => getClick("KeyDefinition")}>
                            <i className="fa fa-th me-2"></i>Key Definition</a>
                        <a  href="#"  className={"nav-item nav-link"+(currentClick==="KeyManagement"? ' active':'')} id="KeyManagement"  onClick={() => getClick("KeyManagement")}>
                            <i className="fa fa-th me-2"></i>Key Management</a>
                        <a href="#"  className={"nav-item nav-link"+(currentClick==="KeyLog"? ' active':'')} id="KeyLog" onClick={() => getClick("KeyLog")}>
                            <i className="fa fa-th me-2"></i>User Management</a>
                        
                        {/* <a href="#"  className={"nav-item nav-link"+(currentClick==="PbkdfCreate"? ' active':'')} id="PbkdfCreate" onClick={() => getClick("PbkdfCreate")}>
                            <i className="fa fa-th me-2"></i>PBKDF</a>
                        <a href="#"  className={"nav-item nav-link"+(currentClick==="TestManagement"? ' active':'')} id="TestManagement" onClick={() => getClick("TestManagement")}>
                            <i className="fa fa-th me-2"></i>TEST PAGE</a> */}
                        
                    </div>
                </nav>
            </div>
        );
};
export default SideBar;
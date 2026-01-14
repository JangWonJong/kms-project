import React, {useState} from 'react';
import RegisterHeader from "../common/header";
import {UserSetting} from "../../../api/keyAPI";
import Modal from "../../../common/modal";

const PasswordSetting = ({setCurrentView,loginData,setLoginData}) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalComment, setModalComment] = useState('');


    // 비밀번호 변경 페이지

    const openModal = () => {
        setModalOpen(true);
    };
    const closeModal = () => {
        setModalOpen(false);
    };


    // 비밀번호 변경 데이터 전달 기능
    const handelSubmit = (e) => {
        // 기존 비밀번호가 맞을경우 통과
            e.preventDefault();
            
            // 변경 비밀번호 데이터
            const prvJson = {
                // "user_name": e.target.user_id.value,
                // "user_id": loginData.user_id,
                "user_id": e.target.user_id.value,
                "user_password": e.target.user_password.value,
                "check_user_password": e.target.user_password_check.value,
            }
            setLoginData(prvJson)
            UserSetting(prvJson).then(res => {
                if (res.form == "false") {
                    alert(res.message)
                    clearFormFields()
                }else {
                    alert(res.message)
                    setCurrentView("KeyDefinition")
                }
            })
    };
    const clearFormFields = () => {
        document.getElementById("user_id").value = "";
        document.getElementById("user_password").value = "";
        document.getElementById("user_password_check").value = "";
    };
    return (
        <>
        <meta charSet="utf-8"/>
        <title>BASESTONE</title>
        <RegisterHeader></RegisterHeader>
        <div className="container-fluid">
            <div className="row h-100 align-items-center justify-content-center" style={{minHeight: '100vh' }}>
                <div className="col-12 col-sm-8 col-md-6 col-lg-5 col-xl-4">
                    <div className="bg-light rounded p-4 p-sm-5 my-4 mx-3">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                                <h3 className="text-primary">비밀번호 변경</h3>
                            {/*<h3>Sign Up</h3>*/}
                        </div>
                        <form onSubmit={handelSubmit}>
                        {/*<div className="form-floating mb-3">*/}
                        {/*    <input type="text" className="form-control" id="user_id" placeholder="jhondoe"/>*/}
                        {/*        <label htmlFor="floatingText">User ID</label>*/}
                        {/*</div>*/}
                        {/*<div className="form-floating mb-3">*/}
                        {/*    <input type="text" className="form-control" id="user_id" placeholder="jhondoe"/>*/}
                        {/*    <label htmlFor="floatingText">ID</label>*/}
                        {/*</div>*/}
                        <div className="form-floating mb-4">
                            <input type="text" className="form-control" id="user_id"
                                   placeholder="Password"
                                    />
                                <label htmlFor="floatingPassword">user_id</label>
                        </div>
                        <div className="form-floating mb-4">
                            <input type="password" className="form-control" id="user_password"
                                   placeholder="Password"/>
                                <label htmlFor="floatingPassword">Password</label>
                        </div>
                            <div className="form-floating mb-4">
                                <input type="password" className="form-control" id="user_password_check"
                                       placeholder="Password"/>
                                <label htmlFor="floatingPassword">Password Check</label>
                            </div>
                        {/*<div className="d-flex align-items-center justify-content-between mb-4">*/}
                        {/*    <div className="form-check">*/}
                        {/*        <input type="checkbox" className="form-check-input" id="exampleCheck1"/>*/}
                        {/*            <label className="form-check-label" htmlFor="exampleCheck1">Check me out</label>*/}
                        {/*    </div>*/}
                        {/*    <a href="src/components/routes/register/login/setting.js">Forgot Password</a>*/}
                        {/*</div>*/}
                        <div className="d-grid gap-2 d-md-flex justify-content-md-end" >
                            <button type="submit" className="btn btn-primary me-md-2 ">변경</button>
                            <button type="submit" onClick={()=>setCurrentView("KeyDefinition")} className="btn btn-danger">취소</button>
                        </div>
                        </form>
                        <Modal open={modalOpen} close={closeModal} header="Confirm">
                            <main>{modalComment}</main>
                        </Modal>
                        {/*<p className="text-center mb-0">Already have an Account? <a href="src/components/routes/register/login/register#setting.js" onClick={()=>setCurrentView("KeyDefinition")}>Sign In</a></p>*/}
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default PasswordSetting;
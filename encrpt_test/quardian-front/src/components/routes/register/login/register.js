import React from 'react';
import RegisterHeader from "../common/header";
import {UserRegister} from "../../../api/keyAPI";


const Register = ({setCurrentView}) => {    
    // 서버로 보내는 데이터
    const handelSubmit = (e) => {
        e.preventDefault();
        const prvJson = {
            "user_id": e.target.user_id.value,
            "user_pw": e.target.user_pw.value,
            "check_user_password": e.target.check_user_password.value,
        }
        // 처리가 끝난 후 로그인 페이지로 이동
        UserRegister(prvJson).then(res => {
            if (res.form === 'false') {
                if (res.message === "이미 관리자 계정이 존재하기 때문에 생성할 수 없습니다.") {
                    alert(res.message);
                    setCurrentView("Login")
                } else {
                    alert(res.message);
                }
            } else if (res.form === 'true') {
                alert(res.message);
                setCurrentView("Login")
            }
            clearFormFields();
        }  
      )
    };

    const clearFormFields = () => {
        document.getElementById("user_id").value = "";
        document.getElementById("user_pw").value = "";
        document.getElementById("check_user_password").value = "";
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
                            <a href="index.html" className="">
                                <h3 className="text-primary"><i className="fa fa-hashtag me-2"></i>BASESTONE</h3>
                            </a>
                            {/* <h3>Sign Up</h3> */}
                        </div>
                        <form onSubmit={handelSubmit}>
                        <div className="form-floating mb-3">
                            <input type="text" className="form-control" id="user_id" placeholder="jhondoe"/>
                            <label htmlFor="floatingText">ID</label>
                        </div>
                        <div className="form-floating mb-4">
                            <input type="password" className="form-control" id="user_pw"
                                   placeholder="Password"/>
                                <label htmlFor="floatingPassword">Password</label>
                        </div>

                        <div className="form-floating mb-5">
                            <input type="password" className="form-control" id="check_user_password"
                                   placeholder="Password"/>
                                <label htmlFor="floatingPassword">Check Password</label>
                        </div>

                        <div className="d-flex align-items-center justify-content-between mb-4">

                        </div>
                        <button type="submit" className="btn btn-primary py-3 w-100 mb-4">
                            Sign Up
                            </button>
                        </form>
                        <p className="text-center mb-0">Already have an Account? <a href="#" onClick={()=>setCurrentView("Login")}>Sign In</a></p>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default Register;
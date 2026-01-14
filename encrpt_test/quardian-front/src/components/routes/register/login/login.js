import React, {useState} from 'react';
import RegisterHeader from "../common/header";
import {UserLogin} from "../../../api/keyAPI";
import Swal from 'sweetalert2'
import Cookies from 'js-cookie';
import axios from 'axios';


const Login = ({setCurrentView,getClick,setLoginData}) => {
    const setIp = 'https://192.168.0.4:5000'

    const [inputId, setInputId] = useState('')
    const handleInputId = (e) => {
        setInputId(e.target.value)
    }

    const handelSubmit = (e) => {
        e.preventDefault();
        const prvJson = {
            "user_id": e.target.user_id.value,
            "user_pw": e.target.user_pw.value,
        }
        UserLogin(prvJson).then(res => {
            if (res.form === 'false') {
                Swal.fire(res.message);
                clearFormFields();           
            }else {
                fetch(setIp + '/decode_token', {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                    })
                Swal.fire('로그인 성공!', e.target.user_id.value+"님 로그인되었습니다.", 'success')
                const options = {
                    path: '/',
                    sameSite: 'Lax',
                    //sameSite: 'Strict',
                    secure : true,
                }
                Cookies.set('user_id',  JSON.stringify( e.target.user_id.value), options);
                setTimeout(() => {
                    alert("로그인 정보가 만료되었습니다. 다시 로그인 해주세요.")
                    fetch(setIp + '/decode_token', {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                    })
                    window.location.reload();
                }, 30 * 60 * 1000) // 30분
                getClick("KeyDefinition")
                setLoginData(res)
            }
        })
    };
    const clearFormFields = () => {
        document.getElementById("user_id").value = "";
        document.getElementById("user_pw").value = "";
    };
    return (
        <>
            <meta charSet="utf-8"/>
            <title>BASESTONE</title>
        <RegisterHeader></RegisterHeader>
        <div className="container-fluid">
            <div className="row h-100 align-items-center justify-content-center" style={{minHeight: '100vh' }}>

                <div className="col-12 col-sm-8 col-md-6 col-lg-5 col-xl-4">
                    <h1 className="text-primary" style={{textAlign:'center',fontSize:'xxx-large'}}> WJ </h1>
                    <div className="bg-light rounded p-4 p-sm-5 my-4 mx-3">
                        {/* <div className="d-flex align-items-center justify-content-between mb-3">
                            <a href="#" onClick={()=>getClick("KeyDefinition")} >
                                <h3 className="text-primary" ><i className="fa fa-hashtag me-2"></i>BASESTONE</h3>
                            </a>
                            <h3>비로그인</h3>
                        </div> */}
                        <form onSubmit={handelSubmit}>
                        <div className="form-floating mb-3">
                            <input type="text" className="form-control" id="user_id"
                                   placeholder="ID" onChange={handleInputId}/>
                            <label htmlFor="floatingInput">ID</label>
                        </div>
                        <div className="form-floating mb-4">
                            <input type="password" className="form-control" id="user_pw"
                                   placeholder="Password"/>
                            <label htmlFor="floatingPassword">Password</label>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            {/*<div className="form-check">*/}
                            {/*    <input type="checkbox" className="form-check-input" id="exampleCheck1"/>*/}
                            {/*    <label className="form-check-label" htmlFor="exampleCheck1">Check me out</label>*/}
                            {/*</div>*/}
                            {/*<a href="">Forgot Password</a>*/}
                        </div>
                        <button type="submit" className="btn btn-primary py-3 w-100 mb-4">Sign In</button>
                        </form>
                        <h2 className="text-primary" style={{textAlign:'center'}}> BASESTONE/이상훈 </h2>
                        <p className="text-center mb-0">Don't have an Account? <a href="/#" onClick={()=>{setCurrentView("Register")}} >Sign Up</a></p>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default Login;
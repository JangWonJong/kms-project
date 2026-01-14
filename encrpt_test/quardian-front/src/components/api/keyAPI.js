import axios from "axios";


// 서버 주소
// const ip = 'https://127.0.0.1:5000'
const ip = 'https://192.168.0.4:5000'
// const ip = 'http://127.0.0.1:5000'

export const KeyList = async () => {
    const csrfResponse = await axios.get(ip + '/get_csrf_token', { withCredentials: true });
    const csrfToken = csrfResponse.data.csrf_token;

    //axios 사용하여 비동기 처리
    //post 방식으로 데이터 전송
    const res = await axios.post(ip + '/fetch_key_list', '', {
        withCredentials: true,
        headers: {
            'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
    });
    //리턴받는 데이터
    const data = res.data
    return data
}

export const KeyDefSave = async (post) => {

    const res = await axios.post(ip + '/fetch_key_definition', post)
    const data = res.data['data']
    return data
}


export const KeyDefUpdate = async (post) => {

    const res = await axios.post(ip + '/update_key_definition', post)
    const data = res.data

    return data
}
export const KeyDefInsert = async (post) => {

    const res = await axios.post(ip + '/create_key_definition', post,)

    const data = res.data

    return data
}

export const keyDataInsert = async (post) => {

    const res = await axios.post(ip + '/key_data_insert', post)

    const data = res.data

    return data[0]
}

export const keyDelete = async (post) => {

    const res = await axios.post(ip + '/delete_key_definition', post)
    const data = res.data

    return data
}

export const KMSSearchAPI = async (post) => {

    const res = await axios.post(ip + '/search_key_definition', post)
    const data = res.data

    return data
}



export const PrivilegeInsert = async (post) => {

    const res = await axios.post(ip + '/create_proj_privilege', post)
    const data = res.data

    return data
}
export const PrivilegeList = async () => {

    const res = await axios.post(ip + '/fetch_privilege_list')

    const data = res.data
    return data
}
export const PrivilegeSave = async (post) => {

    const res = await axios.post(ip + '/fetch_proj_privilege', post)
    const data = res.data.data[0]

    return data
}
export const PrivilegeUpdate = async (post) => {

    const res = await axios.post(ip + '/update_proj_privilege', post)
    const data = res.data

    return data
}

export const UserRegister = async (post) => {

    const res = await axios.post(ip + '/join', post)
    const data = res.data
    
    return data
}

export const UserSetting = async (post) => {

    const res = await axios.post(ip + '/setting_user', post)
    const data = res.data

    return data
}

// export const UserLogin = async (post) => {
//     try {
//         const res = await axios.post(ip + '/login_user', post, {withCredentials: true});
//         const data = res.data
//         console.log(res)
//         return data
//     } catch(error) {
//         console.log(error);
//         return null;
//     }
// }


export const UserLogin = async (post) => {
    try {
        //const csrfResponse = await axios.get('https://localhost:5000/get_csrf_token', { withCredentials: true });
        
        const csrfResponse = await axios.get(ip + '/get_csrf_token', { withCredentials: true });
        const csrfToken = csrfResponse.data.csrf_token;

        const res = await axios.post(ip + '/login_user', post, {
            withCredentials: true,
            headers: {
                'X-CSRFToken': csrfToken,
            },
            credentials: 'include',
        });
        const data = res.data;
        return data;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const Pbkdf = async (user_id, user_pw) => {
    const inputData = {
        'user_id': user_id,
        'kek_password': user_pw
    }
    const res = await axios.post(ip + '/pbkdf', inputData)
    const data = res.data
    return data

}

export const Issue_key = async (post) => {
    
    const res = await axios.post(ip + '/issue_key', post)
    const data = res.data
    return data

}

export const Reissuance_key = async (post) => {
    
    const res = await axios.post(ip + '/reissuance_key', post)
    const data = res.data
    return data

}
export const Del_Issue_key = async(post)=>{
    const res = await axios.post(ip + '/delete_issued_key',post)
    const data = res.data
    return data
}



export const changeInvalidate = async (post) => {

    const res = await axios.post(ip + '/change_invalidate', post)
    const data = res.data

    return data[0]
}

export const GetKey = async (post) => {

    //UUID의 경우에 사이즈가 없기 때문에 다른 주소로 호출해야함
    if (post.data_type == "UUID") {
        const res = await axios.post(ip + '/kmsui/uuid', post)
        const data = res.data
        return data

    } else {
        const res = await axios.post(ip + '/kmsui/' + post.data_type + '/' + post.size, post)
        const data = res.data
        return data
    }
}

export const PostNonce = async (post) => {

    const res = await axios.post(ip + '/get_nonce', post)
    const data = res.data

    return data
}

export const KeyLog = async (post) => {
    const res = await axios.post(ip + '/key_log', post)
    const data = res.data
    return data
}

export const GetKeyLog = async () => {
    const csrfResponse = await axios.get(ip + '/get_csrf_token', { withCredentials: true });
    const csrfToken = csrfResponse.data.csrf_token;


    const res = await axios.post(ip +'/get_key_log','', {
        withCredentials: true,
        headers: {
            'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
    });

    const data = res.data
    return data
}





export const GetApiKeys = async () => {

    const res = await axios.post(ip + '/fetch_api_keys',"")
    const data = res.data
    return data
}

export const GetApiKeys2 = async (num) => {

    const res = await axios.post(ip + '/getmongo/' + num,"")
    const data = res.data

    return data
}

export const SearchAPI = async (post) => {
    const res = await axios.post(ip + '/kmsui/searchAPI', post)
    const data = res.data
    return data
}
export const ApiCreate = async (type, size, expireDate, token) => {

    // Bearer 토큰을 전달하는 헤더 형성
    const headers = {
        'Authorization': token,
    }

    // 만료일자 json 데이터 포멧으로 형성
    const inputExpireDate = {"expire_date": expireDate}

    // UUID의 경우에 사이즈가 없기 때문에 다른 주소로 호출해야함
    if (type == "UUID") {
        const res = await axios.post(ip + '/uuid', inputExpireDate, {headers})
        const data = res.data
        return data["key"]
    }
    const res = await axios.post(ip + type + '/' + size, inputExpireDate, {headers})
    const data = res.data
    return data["key"]
}




export const ChangeToken = async (changeToken,originalToken) => {
    // 토큰 변경을 위한 변경 전 토큰 데이터
    const headers = {
        'Authorization': originalToken,
    }
    const res = await axios.post(ip + '/change_token',changeToken, {headers})
    const data = res.data
    return data
}

export const GetCurrentToken = async () => {
    const res = await axios.post(ip + '/current_token')
    const data = res.data
    return data
}

export const MakeToken = async () => {
    const res = await axios.post(ip + '/make_token')
    const data = res.data
    return data
}
export const GetTokenList = async () => {
    const res = await axios.post(ip + '/get_token_list')
    const data = res.data
    return data
}

export const DeleteToken = async (tokenData) => {
    const tdata={
        "token":tokenData
    }
    const res = await axios.post(ip + '/delete_token',tdata)
    const data = res.data
    return data
}
export const DeleteApi = async (keyData) => {
    const kdata={
        "key_data":keyData
    }
    const res = await axios.post(ip + '/kmsui/delete_api_key',kdata)
    const data = res.data
    return data
}

export const KeyDataRefresh = async (post) => {

    const res = await axios.post(ip + '/key_data_refresh', post)

    const data = res.data

    return data
}
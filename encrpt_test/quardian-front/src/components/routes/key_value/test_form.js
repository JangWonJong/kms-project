import {useState} from "react";
import axios from "axios";
import Cookies from "js-cookie";

const TestForm = () => {


    // const readID = JSON.parse(sessionStorage.getItem('user_data')).user_id
    const userDataId = Cookies.get('user_id');
    const readID = JSON.parse(decodeURIComponent(userDataId))

    const [inputs, setInputs] = useState({
        id: readID,
        kek_password: "",
      });
    
      const { id, kek_password } = inputs; // 비구조화 할당을 통해 값 추출
    
      const handleChange = (e) => {
        const { value, name } = e.target; // e.target에서 value와 name 추출
        setInputs({
          ...inputs, // 기존의 input 객체를 복사(불변성을 위해)
          [name]: value, // name 키를 가진 값을 value 로 변경
        });
      };
    
      const onReset = (e) => {
        setInputs({
          id: "",
          kek_password: "",
        });
      };
    
      return (
        <div>
          <input name="id" onChange={handleChange} value={id} placeholder="아이디" />
          <input name="kek_password" onChange={handleChange} value={kek_password} placeholder="password"/>
          <button onClick={onReset}>초기화</button>
          <div>
            <b>
              값 : {id}({kek_password})
            </b>
          </div>
        </div>
      );
    
}

export default TestForm;
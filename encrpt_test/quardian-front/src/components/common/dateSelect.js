import React from 'react';
import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";

const DateSelect = ({startDate,timeChange}) => {

    return (
        <div>
            <DatePicker
                id="expire_date"
                selected={startDate} // 처음에 맨 위에 표시된 input에 나오는게 지금 날짜
                onChange={(date) => timeChange(date)} // 내가 선택한 날짜가 맨 위에 표시 됨
                showTimeSelect // 시간 나오게 하기
                timeFormat="HH:mm" //시간 포맷
                timeIntervals={1} // 15분 단위로 선택 가능한 box가 나옴
                timeCaption="time"
                dateFormat="yyyy-MM-d  HH:mm"
            />
        </div>
    );
};

export default DateSelect;
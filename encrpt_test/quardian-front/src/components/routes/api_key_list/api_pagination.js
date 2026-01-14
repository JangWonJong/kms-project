import React, {useEffect, useState} from 'react';
import {useContext} from "react";
import {ApiKeyLogContext} from "./api_key";

const ApiPagination = ({total}) => {
    const {limit, setPage, page,setApiPageNum,apiPageNum} = useContext(ApiKeyLogContext)
    const numPages = Math.ceil(total / limit);
    const [totalPageArray, setTotalPageArray] = useState([]);
    const [currentPageArray, setCurrentPageArray] = useState([]);

    useEffect(() => {
        const slicedPageArray = sliceArrayByLimit(total, limit);
        setTotalPageArray(slicedPageArray);
        setCurrentPageArray(slicedPageArray[0]);

    }, [total]);


    const lastPage=()=>{
        if(numPages%10===0){
            return numPages
        }
        else {
            return Math.floor(numPages/10)*10+1
        }
    }
    const disablePageMove = ()=>{
        if(numPages%10===0){
           return  (Math.floor(total/limit/10)*10+1)-10
        }
        else{
            return Math.floor(total/limit/10)*10+1
        }
    }

    const sliceArrayByLimit = (total, limit) => {
        const totalPageArray = Array(Math.ceil(total / limit))
            .fill()
            .map((_, i) => i);

        return Array(Math.ceil(total / limit))
            .fill()
            .map(() => totalPageArray.splice(0, limit));
    };
    const nextButton = () =>{
        setApiPageNum(apiPageNum+1)
    }

    useEffect(() => {
        if (page % limit === 1) {
            setCurrentPageArray(totalPageArray[Math.floor(page / limit)]);
        }
        else if (page % limit === 0) {
            setCurrentPageArray(totalPageArray[Math.floor(page / limit) - 1]);
        }
    }, [page]);

    return (
        <>
            <div className="btn-toolbar" style={{display:'inline',textAlign:'center'}} role="toolbar">
                <div className="btn-group me-2"  role="group" aria-label="First group">
                    <button type="button" className="btn btn-secondary" onClick={() => setPage(1)} disabled={page <11 }>
                        &lt;&lt;
                    </button>
                    <button type="button"  className="btn btn-secondary" onClick={() => setPage(Math.floor((page - 11)/10)*10+1)} disabled={page <11 }>
                        &lt;
                    </button>
                    {currentPageArray?.map((i) => (
                        <button type="button" className={"btn btn-outline-primary"+(page===i+1? ' active':'')}
                                key={i + 1}
                                onClick={() => setPage(i + 1)}
                                aria-current={page === i + 1 ? "page" : null}
                        >
                                {i + 1}
                            </button>
                        ))}
                    <button type="button" className="btn btn-secondary" onClick={() => setPage(Math.floor((page + 9)/10)*10+1)} disabled={page >= disablePageMove()}>
                        &gt;
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setPage(lastPage())} disabled={page >= disablePageMove()}>
                       >>
                    </button>

                </div>
                <button type={"button"} className={"btn btn-info m-2"} style={{float:"right"}} onClick={()=>nextButton()}>Next</button>
            </div>
        </>
    );
};

export default ApiPagination;
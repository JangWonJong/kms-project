import React, {Component} from 'react';
import {Button} from "react-bootstrap";

const KdfInsertButton = ({setCurrentView}) => {
    // insert 버튼용 컴포넌트 페이지

    return (
        <>
            <Button type="button" className="btn btn-primary" onClick={() => setCurrentView("PbkdfCreate")}>
                KDF</Button>
        </>
    )
}

export default KdfInsertButton
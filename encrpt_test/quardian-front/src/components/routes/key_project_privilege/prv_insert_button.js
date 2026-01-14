import React, {Component} from 'react';
import {Button} from "react-bootstrap";

const PrvInsertButton = ({setCurrentView}) => {

    return (
        <>
            <Button type="button" className="btn btn-primary" onClick={() => setCurrentView("InsertPrivilege")}>New
                Project Privilege</Button>
        </>
    )
}
export default PrvInsertButton
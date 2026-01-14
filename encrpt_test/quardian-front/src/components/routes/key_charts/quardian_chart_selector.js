import React from 'react';
import {Button} from "react-bootstrap";

const ChartButton = ({setCurrentView}) => {
    return (
        <div className='row'>
            <div className='col-1'>
                <Button className="text-capitalize" onClick={() => setCurrentView("KMSChart")}>
                    KMS
                </Button>
            </div>
            <div className='col-1'>
                <Button type="button" className="text-capitalize" onClick={() => setCurrentView("OTPChart")}>
                    OTP
                </Button>
            </div>
        </div>
        
    )
}

export default ChartButton
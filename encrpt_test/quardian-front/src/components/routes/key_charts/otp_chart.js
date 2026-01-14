import React, {useState} from 'react';
import ChartButton from "./quardian_chart_selector";
import Area from './areachart';
import Donut from './donutchart';

const OTPChart = ({setCurrentView}) => {
    const chart = {
    };


    const [state, setState] = useState(chart)

    return (
        <div className="container-fluid py-4">
            <ChartButton setCurrentView={setCurrentView}></ChartButton>
                <div className="row mt-4">
                    <div className="col">
                    <div className="card z-index-2 h-100">
                        <div className="card-header pb-0 pt-3 bg-transparent">
                        <h6 className="text-capitalize">OTP</h6>
                        </div>
                        <div className="card-body p-3">
                        <div className="chart">
                        <table>
                                <tr>
                                    <td>
                                        <div className='col'>
                                            <Area/>
                                        </div>
                                    </td>
                                    <td>
                                        <div className='col'>
                                            <Donut/>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                <div className="row mt-4">
                    <div className="col">
                    <div className="card ">
                        <div className="table-responsive">
                        <div className="card-body p-3">
                        <table className="table align-items-center ">
                            <thead>
                            <tr>
                                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Country</th>
                                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Sales</th>
                                <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Flag</th>
                                <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Flag</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td className="w-30">
                                <div className="d-flex px-2 py-1 align-items-center">
                                    <div className="ms-4">
                                    <h6 className="text-sm mb-0">United States</h6>
                                    </div>
                                </div>
                                </td>
                                <td>
                                <div className="text-left">
                                    <h6 className="text-sm mb-0">2500</h6>
                                </div>
                                </td>
                                <td>
                                <div className="text-center">
                                    <h6 className="text-sm mb-0">$230,900</h6>
                                </div>
                                </td>
                                <td className="align-middle text-sm">
                                <div className="col text-center">
                                    <h6 className="text-sm mb-0">29.9%</h6>
                                </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
    );
};

export default OTPChart;
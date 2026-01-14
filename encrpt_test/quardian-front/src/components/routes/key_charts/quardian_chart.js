import React, {useState} from 'react';
import ReactApexChart from "react-apexcharts";

const QuardianChart = () => {
    // 차트 페이지
    // react-apexcharts 사용함
    // 예시 상태이며 수정하여 사용
    const chart = {
        options: {
            chart: {
                id: "line"
            },
            xaxis: {
                categories: ['11-08', '11-09', '11-10', '11-11', '11-12', '11-13','11-14', '11-15']
            }
        },
        series: [
            {
                name: "KEY 1",
                data: [30, 40, 45, 50, 49, 60, 70, 91]
            },
            {
                name: "KEY 2",
                data: [25, 37, 47, 55, 59, 62, 85, 93]
            }
        ]
    };


    const [state, setState] = useState(chart)
    return (
        <div>
            <div className="container-fluid pt-4 px-4">
                <div className="row g-4">
                    <div className="bg-light rounded h-100 p-4" style={{flex: 'auto', float: 'left'}}>
                        {/*<h6 className="mb-4">Define RNG</h6>*/}

                        <div id="chart">
                            <ReactApexChart options={state.options} series={state.series} type="line" height={500}/>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default QuardianChart;
import React, { Component } from "react";
import Chart from "react-apexcharts";

class KMSArea extends Component {
  constructor(props) {
    super(props);

    this.state = {
      options: {
        chart: {
          id: "basic-bar"
        },
        xaxis: {
          categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999]
        },
        stroke: {
          curve: 'smooth'
        },
        dataLabels: {
          enabled: false
        },
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.7,
            opacityTo: 0.9,
            stops: [0, 90, 100]
          }
        },
      },
      series: [
        {
          name: "series-1",
          data: [30, 40, 45, 50, 49, 60, 70, 91, 100, 40, 45, 50, 49, 60, 70, 91, 100, 40, 45, 50, 49, 60, 70, 91, 100]
        }
      ]
    };
  }

  render() {
    return (
          <span className="mixed-chart">
            <Chart
              options={this.state.options}
              series={this.state.series}
              type="area"
              width="1000"
              height="400"
            />
          </span>
    );
  }
}

export default KMSArea;
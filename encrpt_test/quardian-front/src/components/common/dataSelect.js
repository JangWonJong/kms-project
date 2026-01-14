
import React, {Component} from "react";

class Footer extends Component {
    render() {
        return(
            <div className="container-fluid pt-4 px-4">
                <div className="bg-light rounded-top p-4">
                    <div className="row">
                        <div className="col-12 col-sm-6 text-center text-sm-start">
                            &copy; <a style={{color: "#009CFF"}}>Basestone</a>, All Right Reserved
                        </div>
                        <div className="col-12 col-sm-6 text-center text-sm-end">
                            {/*Made for <a style={{color:#009CFF}}>Afreeca TV</a>*/}
                        </div>
                    </div>

                </div>

            </div>
        )
    }
}

export default Footer
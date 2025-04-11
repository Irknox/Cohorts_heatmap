import React from "react";
import CohortHeatmap from "../components/cohort_heatmap";

const CohortMain = () => {
    return (
        <div style={{width: "100%", height: "850px"}}>
            <h1 style={{textAlign:"center",fontFamily:"Tahoma"}}>Heatmap</h1>
            <CohortHeatmap />
        </div>
    );
};

export default CohortMain;
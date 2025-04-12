import React from "react";
import CohortHeatmap from "../components/cohort_heatmap";

const CohortMain = () => {
    return (
        <div style={{width: "100%", height: "1200px", 
            fontFamily: "Roboto, sans-serif", }}>
            <h2 style={{textAlign:"center",fontFamily:"arial"}}>Informe distribucion de cohortes</h2>
            <CohortHeatmap />
        </div>
    );
};

export default CohortMain;
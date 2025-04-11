import React, { useEffect, useState } from "react";
import * as echarts from "echarts";
import { getBalanceData } from "../services/cohort_services";

const CohortHeatmap = () => {
    const [chartData, setChartData] = useState([]);
    const [cohortNames, setCohortNames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getBalanceData();

                // Extraer nombres únicos de cohortes para el eje Y
                const uniqueCohortNames = [...new Set(data.map(item => item.nombre_cohorte))];

                // Transformar los datos para el heatmap
                const transformedData = data.map(item => ({
                    x: item.quincena - 1, // Eje X (quincena, ajustado a índice 0)
                    y: uniqueCohortNames.indexOf(item.nombre_cohorte), // Eje Y (índice del nombre de cohorte)
                    porcentaje: item.porcentaje_activas, // Valor (porcentaje activas)
                    cantidad: item.cantidad_activas // Valor adicional (cantidad activas)
                }));

                setCohortNames(uniqueCohortNames);
                setChartData(transformedData);
                setLoading(false);
            } catch (error) {
                console.error("Error al obtener los datos:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!loading) {
            const chartDom = document.getElementById("main");
            const myChart = echarts.init(chartDom);

            const option = {
                tooltip: {
                    position: "top",
                    formatter: (params) => {
                        const dataItem = chartData[params.dataIndex];
                        return `
                            <b>Cohorte:</b> ${cohortNames[dataItem.y]}<br/>
                            <b>Quincena:</b> ${dataItem.x + 1}<br/>
                            <b>Porcentaje Activas:</b> ${dataItem.porcentaje}%<br/>
                            <b>Cantidad Activas:</b> ${dataItem.cantidad}
                        `;
                    },
                },
                grid: {
                    height: "90%",
                    width: "84%",
                },
                xAxis: {
                    type: "category",
                    data: Array.from({ length: 36 }, (_, i) => `Q${i + 1}`), // Quincenas del 1 al 36
                    splitArea: {
                        show: true,
                    },
                },
                yAxis: {
                    type: "category",
                    data: cohortNames, 
                    splitArea: {
                        show: true,
                    },
                },
                visualMap: {
                    min: 0,
                    max: 100, // Porcentaje máximo
                    calculable: true,
                    orient: "vertical",
                    right: "right",
                    top: "middle",
           
                    text: ["Porcentaje Activas"],
                    inRange: {
                        color: ["#e3735c", "#f3fa5b", "#2dcbb3", "#1deb5b"], // Gradiente de colores: rojo -> azul -> verde
                    },
                },
                series: [
                    {
                        name: "Cohortes",
                        type: "heatmap",
                        data: chartData.map(({ x, y, porcentaje }) => [x, y, porcentaje]), // Solo pasamos [x, y, porcentaje] para el heatmap
                        label: {
                            show: true,
                            formatter: (params) => {
                                const dataItem = chartData[params.dataIndex];
                                return `${dataItem.porcentaje}%\n(${dataItem.cantidad})`;
                            },
                        },
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowColor: "rgba(0, 0, 0, 0.5)",
                            },
                        },
                    },
                ],
            };

            myChart.setOption(option);
        }
    }, [chartData, cohortNames, loading]);

    return (
        <div style={{ width: "100%", height: "100%" }}>
            {loading ? (
                <p>Cargando datos...</p>
            ) : (
                <div id="main" style={{ width: "100%", height: "100%" }}></div>
            )}
        </div>
    );
};

export default CohortHeatmap;
import { Card } from "flowbite-react";
import AxiosClient from '../../../../config/http-client/axios-client';
import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent
} from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition
]);

function Monitoreo() {
  const chartRef = useRef(null);

  const [users, setUsers] = useState([]);
  const [datosGrafica, setDatosGrafica] = useState([]);
  const [loading, setLoading] = useState(true);

  const getUsers = async () => {
    try {
      const response = await AxiosClient({
        url: "/inversor/consultar",
        method: 'GET',
      });
      console.log(response);

      if (!response.error) {
        setUsers(response.data);
      }

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const infodivice = async (id) => {
    setLoading(true);
    try {
      const response = await AxiosClient({
        url: `/inversor/consulta/${id}`,
        method: 'GET',
      });
      console.log(response);

      if (!response.error) {
        setDatosGrafica(response.data);
      }

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const extractData = (response) => {
    let data = [];
    Object.keys(response).forEach(timestamp => {
      response[timestamp].forEach(entry => {
        if (entry.nombre === "EnergyExported") {
          data.push([new Date(entry.fecha).getTime(), parseFloat(entry.valor)]);
        }
      });
    });
    return data.sort((a, b) => a[0] - b[0]); // Ensure the data is sorted by time
  };

  useEffect(() => {
    getUsers();
  }, []);



  useEffect(() => {
    if (datosGrafica.length === 0) return;

    const chartDom = chartRef.current;
    const myChart = echarts.init(chartDom);

    const option = {
      tooltip: {
        trigger: 'axis',
        position: function (pt) {
          return [pt[0], '10%'];
        }
      },
      title: {
        left: 'center',
        text: 'Energy Exported Over Time'
      },
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: 'none'
          },
          restore: {},
          saveAsImage: {}
        }
      },
      xAxis: {
        type: 'time',
        boundaryGap: false
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '100%']
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 20
        },
        {
          start: 0,
          end: 20
        }
      ],
      series: [
        {
          name: 'Energy Exported',
          type: 'line',
          smooth: true,
          symbol: 'none',
          areaStyle: {},
          data: extractData(datosGrafica)
        }
      ]
    };

    myChart.setOption(option);

    const handleResize = () => {
      myChart.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      myChart.dispose();
    };
  }, [datosGrafica]);

  return (
    <>
      <div className='w-full flex flex-row justify-end items-end p-6'>
        <div className='w-full grid justify-start items-start '>
          {loading ? (
            <p>Loading...</p>
          ) : (

            
            users.map((user, index) => (
              <Card key={index} href="#" className="max-w-sm mb-4" onClick={() => infodivice(user.id)}>
                <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {user.id} {user.name}
                </h5>
                <p className="font-normal text-gray-700 dark:text-gray-400">
                  PVS: {user.pvs}
                </p>
              </Card>

            ))


          )}
        </div>

        <div className="" ref={chartRef} style={{ width: '50%', height: '400px', position: "absolute", top: "0", marginTop: "100px" }} />
     
     
      </div>
    </>
  );
}

export default Monitoreo;

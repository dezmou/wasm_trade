import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import { init } from "./engine"
// import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)
declare const Chart: any

type lineProps = React.ComponentProps<typeof Line>

function App() {
  const [ready, setReady] = useState(false);
  const [graph1, setGraph1] = useState<lineProps["data"] | null>(null)
  useEffect(() => {
    ; (async () => {
      const engine = await init();
      const res = engine.funcs.getSituation(50600)
      console.log(res);
      setGraph1({
        labels:  res.sit as any,
        datasets: [
          {
            label: "open",
            data: res.sit,
            fill: true,
            backgroundColor: "rgba(75,192,192,0.2)",
            borderColor: "rgba(75,192,192,1)"
          },
        ]
      })
      setReady(true);

      // const config = {
      //   type: 'line',
      //   data: data,
      //   options: {}
      // };

      // const myChart = new Chart(
      //   document.getElementById('myChart'),
      //   config
      // );

    })()
  }, [])

  return <>
    {ready && <div>
      <Line data={graph1!}></Line>
    </div>}
  </>
}

export default App;

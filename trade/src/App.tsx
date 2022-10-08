import React, { useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import { init, LINE_SIZE } from "./engine"
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
  const engine = useRef<Awaited<ReturnType<typeof init>> | null>(null)
  const cursor = useRef(5000);
  const [cursorR, setCursorR] = useState("5000");

  const searchSituation = (cursor: number) => {
    const nbrSearch = 10000;
    for (let i = 0; i < nbrSearch; i++) {
      const res = engine.current!.funcs.getSituation(cursor + i)
      return { res, cursor: cursor + i };
      // if (res.max > 10000) {
      // }
    }
    return { res: null, cursor: cursor + nbrSearch }
  }

  const search = () => {
    const res = searchSituation(cursor.current);
    setCursorR(`${cursor.current} / ${engine.current!.data.byteLength / LINE_SIZE}`);
    if (res.res) {
      setGraph1({
        labels: res.res.sit as any,
        datasets: [
          {
            label: "open",
            data: res.res.sit,
            fill: true,
            backgroundColor: "rgba(75,192,192,0.2)",
            borderColor: "rgba(75,192,192,1)",
            animation: false
          },
        ]
      })
    }
    cursor.current = res.cursor + 1;
  }

  useEffect(() => {
    ; (async () => {
      engine.current = await init();
      setReady(true);
      // while(true){
      //   search()
      //   await new Promise(r => setTimeout(r, 10));
      // }
    })()
  }, [])

  return <>
    {ready && <div>
      <button onClick={search}>Search next</button>
      {graph1 && <Line data={graph1!}></Line>}
      {cursorR}

    </div>}
  </>
}

export default App;

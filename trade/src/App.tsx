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
  const cursor = useRef(50000);
  const [cursorR, setCursorR] = useState("5000");

  const search = () => {
    console.log("LAUNCH");
    const res = engine.current!.funcs.getSituation(cursor.current);
    console.log("DONE");

    // setCursorR(`${cursor.current} / ${engine.current!.data.byteLength / LINE_SIZE}`);
    if (res.cursorRes !== -1) {
      // const points = Array.from(engine.current!.data.slice(cursor.current!, cursor.current! + 100))

      const final = [];
      for (let i = 0; i < 50; i++) {
        const line = engine.current!.getLine(i);
        console.log(line);
      }

      return;
      // setGraph1({
      //   labels: points,
      //   datasets: [
      //     {
      //       label: "open",
      //       data: points,
      //       fill: true,
      //       backgroundColor: "rgba(75,192,192,0.2)",
      //       borderColor: "rgba(75,192,192,1)",
      //       animation: false
      //     },
      //   ]
      // })
    }
    cursor.current = res.cursorRes + 1;
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

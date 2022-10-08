import React, { useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import { init, LINE_SIZE, MIN_CURSOR } from "./engine"
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
  const cursorRef = useRef(MIN_CURSOR);

  const search = (cursor: number) => {
    const res = engine.current!.funcs.getSituation(cursor);
    return res;

    // setCursorR(`${cursor.current} / ${engine.current!.data.byteLength / LINE_SIZE}`);
    // const points = Array.from(engine.current!.data.slice(cursor.current!, cursor.current! + 100))

    // const finalBefore = [];
    // const finalAfter = [];
    // const final = [];
    // const bg = [];
    // for (let i = res.cursorRes - 50; i < res.cursorRes + 50; i++) {
    //   const line = engine.current!.getLine(i);
    //   if (i <= res.cursorRes) {
    //     finalBefore.push(line.close);
    //   } else {
    //     finalAfter.push(line.close);
    //   }
    //   final.push(line.close)
    //   if (i >= res.cursorRes && i <= res.cursorRes + 5) {
    //     bg.push("red")
    //   } else {
    //     bg.push("blue");
    //   }
    // }

    // for (let i = res.cursorRes; i <= res.cursorRes + 50; i++) {
    //   const line = engine.current!.getLine(i);
    //   final.push(line.close);
    // }
    // return {
    //   finalBefore,
    //   finalAfter,
    //   final,
    //   bg,
    //   cursor: res.cursorRes,
    // }
    // cursor.current = res.cursorRes + 1;
    // setCursorR(`${cursor.current!}`);
  }

  const printGraph = (cursor: number) => {
    const finalBefore = [];
    const finalAfter = [];
    const final = [];
    const bg = [];
    for (let i = cursor - 50; i < cursor + 50; i++) {
      const line = engine.current!.getLine(i);
      if (i <= cursor) {
        finalBefore.push(line.close);
      } else {
        finalAfter.push(line.close);
      }
      final.push(line.close)
      if (i >= cursor && i <= cursor + 5) {
        bg.push("red")
      } else {
        bg.push("blue");
      }
    }

    setGraph1({
      labels: final.map((e, i) => i),
      datasets: [
        {
          label: "open",
          data: final,
          // fill: true,
          backgroundColor: bg,
          borderColor: bg,
          animation: false
        },
      ]
    })
  }

  const SearchLot = async () => {
    let cursor = MIN_CURSOR;
    const final = [];
    console.log(engine.current!.getLine(cursor));
    for (let i = 0; cursor < 4048620; i++) {
      const res = search(cursor);
      final.push(res.cursorRes)
      cursor = res.cursorRes + 3;
      console.log(cursor);
      // printGraph(res.cursorRes)
      // await new Promise(r => setTimeout(r, 0));
    }
    console.log(engine.current!.getLine(cursor));
    console.log(final.length);
    console.log(final);
  }

  useEffect(() => {
    ; (async () => {
      engine.current = await init();
      setReady(true);
    })()
  }, [])

  return <>
    {ready && <div>
      <button onClick={() => {
        const res = search(cursorRef.current);
        console.log(res);
        cursorRef.current = res.cursorRes + 6;
        printGraph(res.cursorRes);
      }}>Search next</button>
      <button onClick={SearchLot}>Search a lot</button>
      {graph1 && <Line data={graph1!}></Line>}

    </div>}
  </>
}

export default App;

import React, { useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import { init, LINE_SIZE, MIN_CURSOR } from "./engine"
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
import { recurrent, NeuralNetwork, NeuralNetworkGPU } from "brain.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

type lineProps = React.ComponentProps<typeof Line>

const net = new NeuralNetwork();
// const net = new NeuralNetworkGPU();

function App() {
  const [ready, setReady] = useState(false);
  const [graph1, setGraph1] = useState<lineProps["data"] | null>(null)
  const engine = useRef<Awaited<ReturnType<typeof init>> | null>(null)
  const cursorRef = useRef(MIN_CURSOR);

  const testCursor = useRef(0);

  const search = (cursor: number) => {
    const res = engine.current!.funcs.searchPump(cursor);
    return res;
  }

  const printGraph = (cursor: number) => {
    const finalBefore = [];
    const finalAfter = [];
    const final = [];
    const bg = [];
    const perc = engine.current!.funcs.getPumpPercent(cursor);
    console.log(perc.isWin);

    // for (let i = cursor - 50; i < cursor + 50; i++) {
    for (let i = 0; i < 100; i++) {
      // const line = engine.current!.getLine(i);
      if (i <= cursor) {
        finalBefore.push(perc.situationResult.at(i));
      } else {
        finalAfter.push(perc.situationResult.at(i));
      }
      final.push(perc.situationResult.at(i))
      if (i >= 45 && i <= 50) {
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

  const checkNext = () => {
      const res = search(testCursor.current);
      const perc = engine.current!.funcs.getPumpPercent(res.cursorRes);
      const resBrain = net.run(Array.from(perc.situationResult.subarray(0, 45)))
      console.log(resBrain);
      testCursor.current = res.cursorRes + 1;
      printGraph(testCursor.current);
      testCursor.current += 1;
  }

  const searchLot = async () => {
    let cursor = MIN_CURSOR;
    const final = [];

    const trainingData: any[] = [];

    // for (let i = 0; cursor < 4048620; i++) {
    for (let i = 0; cursor < MIN_CURSOR + 800000; i++) {
      const res = search(cursor);
      final.push(res.cursorRes)

      const perc = engine.current!.funcs.getPumpPercent(res.cursorRes);
      trainingData.push({
        input: Array.from(perc.situationResult.subarray(0, 45)),
        output: { isWin: perc.isWin }
      })
      cursor = res.cursorRes + 1;
      // printGraph(res.cursorRes)
      // await new Promise(r => setTimeout(r, 0));
    }
    console.log(trainingData.length);
    net.train(trainingData);
    testCursor.current = cursor;
    console.log("DONE");
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
        const perc = engine.current!.funcs.getPumpPercent(res.cursorRes);
        cursorRef.current = res.cursorRes + 1;
        printGraph(res.cursorRes);
      }}>Search next</button>
      <button onClick={searchLot}>train</button>
      <button onClick={checkNext}>check next</button>
      {graph1 && <Line data={graph1!}></Line>}

    </div>}
  </>
}

export default App;

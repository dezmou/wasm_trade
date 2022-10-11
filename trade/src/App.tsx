import { NeuralNetwork } from "brain.js";
import {
  CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title,
  Tooltip
} from 'chart.js';
import React, { useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { init, MIN_CURSOR } from "./engine";

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

const net = new NeuralNetwork({
  log: (e) => {
    console.log(e);
  },
  // hiddenLayers: [100, 8],
});
// const net = new NeuralNetworkGPU();


function AppOld() {
  const [ready, setReady] = useState(false);
  const [graph1, setGraph1] = useState<lineProps["data"] | null>(null)
  const engine = useRef<Awaited<ReturnType<typeof init>> | null>(null)
  const cursorRef = useRef(MIN_CURSOR);

  const testCursor = useRef(0);

  const [bakeRes, setBakeRes] = useState({ nbrBet: 0, nbrWon: 0, acc: 0 });

  const search = (cursor: number) => {
    const res = engine.current!.funcs.searchPump(cursor);
    return res;
  }

  const printGraph = (startCursor: number, cursorBet: number) => {
    // const finalBefore = [];
    // const finalAfter = [];
    const final = [];
    const bg = [];
    const perc = engine.current!.funcs.getPercents(startCursor, startCursor + 100);
    const diff = cursorBet - startCursor

    for (let i = 0; i < 100; i++) {
      final.push(perc.situationResult.at(i))
      if (i >= diff - 5 && i <= diff) {
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

  const bake = async () => {
    let nbrBet = 0;
    let betWon = 0;
    for (let i = 0; i < 1000000; i++) {
      if (testCursor.current > 4060000) return;
      const res = search(testCursor.current);
      const perc = engine.current!.funcs.getPercents(res.cursorRes - 50, res.cursorRes);
      const resBrain = net.run((Array.from(perc.situationResult) as any)) as any
      if (resBrain.isWin > 0.7) {
        const isWin = engine.current!.funcs.isWin(testCursor.current)
        nbrBet += 1;
        if (isWin) {
          betWon += 1;
        }
        if (i % 20 === 0) {
          printGraph(testCursor.current - 50, testCursor.current);
          setBakeRes({
            acc: betWon / nbrBet * 100,
            nbrBet: nbrBet,
            nbrWon: betWon
          })
          await new Promise(r => setTimeout(r, 0));
        }
      }
      testCursor.current = res.cursorRes + 1;
    }
  }

  const checkNext = () => {
    const res = search(testCursor.current);
    const perc = engine.current!.funcs.getPercents(res.cursorRes - 50, res.cursorRes);
    const resBrain = net.run((perc.situationResult as any))
    printGraph(testCursor.current - 50, testCursor.current);
    console.log(resBrain);
    testCursor.current = res.cursorRes + 1;
    // testCursor.current += 1;
  }

  const searchLot = async () => {
    let cursor = MIN_CURSOR;
    const final = [];

    const trainingData: any[] = [];

    // for (let i = 0; cursor < 4048620; i++) {
    let nbrTrain = 0;
    for (let i = 0; nbrTrain < 100; i++) {
      const res = search(cursor);
      const perc = engine.current!.funcs.getPercents(res.cursorRes - 50, res.cursorRes);
      const isWin = engine.current!.funcs.isWin(res.cursorRes);
      nbrTrain += 1;
      trainingData.push({
        input: perc.situationResult,
        output: { isWin: isWin }
      })
      cursor = res.cursorRes + 1;
    }
    console.log("training amount :", trainingData.length);
    net.train(trainingData, {
      logPeriod: 500,
    });
    const res = net.toJSON()
    console.log(res);
    testCursor.current = cursor;
    // testCursor.current = MIN_CURSOR;
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
        // const perc = engine.current!.funcs.getPercents(res.cursorRes);
        const isWin = engine.current!.funcs.isWin(res.cursorRes);
        cursorRef.current = res.cursorRes + 1;
        printGraph(res.cursorRes - 50, res.cursorRes);
        console.log(isWin);

      }}>Search next</button>
      <button onClick={searchLot}>train</button>
      <button onClick={checkNext}>check next</button>
      <button onClick={bake}>bake</button>
      {graph1 && <Line data={graph1!}></Line>}
      <div style={{ fontSize: "2rem" }}>
        Nbr bet : {bakeRes.nbrBet} <br />
        Nbr won : {bakeRes.nbrWon} <br />
        <span style={{ fontSize: "3rem" }}>Accuracy : {bakeRes.acc}% <br /></span>
      </div>

    </div>}
  </>
}

// export default App;

function App() {
  const engine = useRef<Awaited<ReturnType<typeof init>> | null>(null)
  const [state, setState] = useState({
    ready: false,
    cursor: 5000,
    graph1: { labels: [], datasets: [] } as lineProps["data"],
  })

  const printGraph = (cursor: number) => {
    const startCursor = cursor - 50;
    const perc = engine.current!.funcs.getPercents(startCursor, cursor + 100);

    const final: number[] = [];
    const bg: string[] = [];

    for (let i = 0; i < 100; i++) {
      final.push(perc.situationResult.at(i)! / 100)
      if (i < 50) {
        bg.push("red")
      } else {
        bg.push("blue");
      }
    }

    setState(e => ({
      ...e,
      graph1: {
        labels: final,
        datasets: [
          {
            label: "close",
            data: final,
            // fill: true,
            backgroundColor: bg,
            borderColor: bg,
            animation: false
          },
        ]
      }
    }))

  }

  useEffect(() => {
    ; (async () => {
      engine.current = await init();
      setState({ ...state, ready: true });
      printGraph(state.cursor)
      console.log("DONE");
    })()
  }, [])

  return <>
    {state.ready && <>
      <div>
        {state.graph1.datasets.length > 0 && <>
          <Line data={state.graph1!}></Line>
        </>}
        {state.cursor}
        <input type="range" value={state.cursor} onChange={(e) => {
          setState({ ...state, cursor: parseInt(e.target.value) })
          printGraph(state.cursor)
        }} min={5000} max={4000000} style={{
          width: "90vw",
        }}></input>

      </div>

    </>}
  </>
}

export default App

import { NeuralNetwork, likely } from "brain.js";
import {
  CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title,
  Tooltip
} from 'chart.js';
import React, { useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { init, MIN_CURSOR } from "./engine";
import moment from "moment"

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
  hiddenLayers: [8],
});

function App() {
  const initialState = {
    ready: false,
    cursor: 5000,
    graph1: { datasets: [] } as lineProps["data"],
    lineString: ``,
    nbrPumpTrain: 10,
    trained: false,
    training: false,
    trainRes: {
      nbrBet: 0,
      nbrWon: 0,
      ratio: 0,
    },
    nextCheck: {
      bet: false,
      percent: 0,
      won: false,
    }
  }
  const [graph2, setGraph2] = useState({ datasets: [] } as lineProps["data"]);

  const engine = useRef<Awaited<ReturnType<typeof init>> | null>(null)
  const forward = useRef(0);
  const [state, setState] = useState(initialState)
  const stateRef = useRef(initialState);

  const updateState = (state: typeof initialState) => {
    stateRef.current = state;
    setState({ ...state });
  }

  const printGraph = () => {
    const startCursor = stateRef.current.cursor - 50;
    const perc = engine.current!.funcs.getPercents(startCursor, stateRef.current.cursor + 50);
    const line = engine.current!.getLine(stateRef.current.cursor)

    const final: number[] = [];
    for (let i = 0; i < 100; i++) {
      final.push(perc.situationResult.at(i)! / 100)
    }

    updateState({
      ...stateRef.current,
      lineString: `${moment.unix(line.time).format()}`,
      graph1: {
        labels: final,
        datasets: [
          {
            label: "close",
            data: final,
            fill: true,
            animation: false,
            segment: {
              borderColor: ctx => {
                return ctx.p0DataIndex + startCursor < stateRef.current.cursor ? "red" : "blue"
              }
            }
          },
        ]
      }
    })

  }

  const simulateNext = () => {
    const res = engine.current!.funcs.searchPump(stateRef.current.cursor + 1);
    const perc = engine.current!.funcs.getPercents(res.cursorRes - 50, res.cursorRes);
    const resBrain = net.run((Array.from(perc.situationResult) as any)) as any
    stateRef.current.nextCheck.bet = false;
    stateRef.current.nextCheck.percent = resBrain.isWin;

    if (resBrain.isWin > 0.7) {
      stateRef.current.nextCheck.bet = true;
      const isWin = engine.current!.funcs.isWin(stateRef.current.cursor)
      stateRef.current.nextCheck.won = isWin === 1 ? true : false;
      stateRef.current.trainRes.nbrBet += 1;
      if (isWin) {
        stateRef.current.trainRes.nbrWon += 1;
      }
      stateRef.current.trainRes.ratio = stateRef.current.trainRes.nbrWon / stateRef.current.trainRes.nbrBet * 100;
    }
    stateRef.current.cursor = res.cursorRes;
  }

  const simulateNextWithPump = () => {
    while (stateRef.current.cursor < 4060000) {
      simulateNext();
      if (stateRef.current.nextCheck.bet) break;
    }
  }

  const simulate = async () => {
    let i = 0;
    while (stateRef.current.cursor < 4060000) {
      i += 1;
      simulateNext();
      if (i % 20 === 0) {
        updateState(stateRef.current);
        printGraph();
        await new Promise(r => setTimeout(r, 0));
      }
      // stateRef.current.cursor = res.cursorRes + 1;
    }
  }

  const train = async () => {
    const final = [];

    const trainingData: any[] = [];
    updateState({ ...stateRef.current, training: true, trained: false })
    let nbrTrain = 0;
    for (let i = 0; nbrTrain < stateRef.current.nbrPumpTrain; i++) {
      const res = engine.current!.funcs.searchPump(stateRef.current.cursor);
      const perc = engine.current!.funcs.getPercents(res.cursorRes - 50, res.cursorRes);
      const isWin = engine.current!.funcs.isWin(res.cursorRes);
      nbrTrain += 1;
      trainingData.push({
        input: perc.situationResult,
        output: { isWin: isWin }
      })
      updateState(stateRef.current);
      printGraph();
      // stateRef.current.cursor = res.cursorRes + 1;
      stateRef.current.cursor = Math.floor(Math.random() * 3000000);
      await new Promise(r => setTimeout(r, 5));
    }
    await new Promise(r => setTimeout(r, 400));
    net.train(trainingData, {
      logPeriod: 500,
    });
    stateRef.current.trained = true;
    updateState(stateRef.current);
    const res = net.toJSON()
    updateState({ ...stateRef.current, training: false, trained: true })
    console.log(res);
  }

  const getTotalGraph = () => {
    const final: number[] = []
    for (let i = 0; i < 4000000; i += 8000) {
      final.push(engine.current!.getLine(i).close);
    }
    return final;
  }

  useEffect(() => {
    ; (async () => {
      engine.current = await init();
      updateState({ ...stateRef.current, ready: true });
      printGraph()
      console.log("READY");
      const totalGraph = getTotalGraph();
      setGraph2({
        labels: totalGraph,
        datasets: [
          {
            label: "btc price",
            data: totalGraph,
            fill: true,
            animation: false,
          },
        ]
      })
      while (true) {
        if (forward.current !== 0) {
          updateState({ ...stateRef.current, cursor: stateRef.current.cursor + forward.current * 3 });
          printGraph();
        }
        await new Promise(r => requestAnimationFrame(r));
        // await new Promise(r => requestAnimationFrame(r));
      }
    })()
  }, [])

  return <>
    {state.ready && <>
      <div>
        {state.graph1.datasets.length > 0 && <>
          <div style={{
            height: "400px",
            width: "90vw",
          }}>
            <Line data={state.graph1!} options={{ maintainAspectRatio: false }}></Line>
          </div>
          <div style={{
            height: "400px",
            width: "90vw",
          }}>
            {/* <Line data={graph2!} options={{ maintainAspectRatio: false }}></Line> */}
          </div>
        </>}
        {state.cursor}<br />
        {state.lineString}<br />
        <input type="range" value={state.cursor} onChange={(e) => {
          updateState({ ...stateRef.current, cursor: parseInt(e.target.value) })
          printGraph()
        }} min={5000} max={4000000} style={{
          width: "90vw",
        }}></input><br />
        <button onMouseDown={() => forward.current = -1} onMouseUp={() => forward.current = 0}>-</button>
        <button onMouseDown={() => forward.current = 1} onMouseUp={() => forward.current = 0}>+</button>
        <button onClick={() => {
          const res = engine.current!.funcs.searchPump(stateRef.current.cursor + 1);
          updateState({ ...stateRef.current!, cursor: res.cursorRes });
          printGraph()

        }}>find next pump</button><br /><br />
        <button onClick={train}>Train from here</button><br />
        nbr pump : <input type="number" value={state.nbrPumpTrain}
          onChange={(e) => {
            updateState(({ ...stateRef.current, nbrPumpTrain: parseInt(e.target.value) }))
          }}
        ></input>
        {state.training && <div>training in progress.... </div>}<br /><br />
        {state.trained && <div>
          <div>
            <button onClick={() => {
              simulateNext()
              updateState(stateRef.current);
              printGraph();
            }}>Check next pump</button>
            <button onClick={() => {
              simulateNextWithPump()
              updateState(stateRef.current);
              printGraph();
            }}>Check next pump with bet</button><br />
            Result : {stateRef.current.nextCheck.percent}<br />
            bet : {stateRef.current.nextCheck.bet ? "yes" : "no"}<br />
            won : {stateRef.current.nextCheck.won ? "yes" : "no"}<br />
            <br />
          </div>
          <button onClick={simulate}>Check all remaining</button><br />
          nbrBet : {state.trainRes.nbrBet}<br />
          nbrWon : {state.trainRes.nbrWon}<br />
          <strong>ratio : {state.trainRes.ratio}</strong><br />
        </div>}

      </div>

    </>
    }
  </>
}

export default App

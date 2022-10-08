import React, { useEffect } from 'react';
import logo from './logo.svg';

const LINE_SIZE = 4 * 6;
const SITUATION_SIZE = 100;
const SITUATION_AMOUNT = 4;
const SITUATION_STEP = 5;

interface Abi {
  getSituation: (
    memData: number,
    memRresult: number,
    misc: number,
    cursor: number,
    situationSize: number
  ) => void
}

const misc = {
  resMin: 0,
  resMax: 0,
}

function App() {
  useEffect(() => {
    ; (async () => {
      const data = await (await (await fetch("./bin/btc_tohlcv")).blob()).arrayBuffer()

      // Set memory
      const memory = new WebAssembly.Memory({
        initial: (data.byteLength / 64000) + (SITUATION_SIZE * 4) + (Object.keys(misc).length * 4)
      });
      (new Uint8ClampedArray(memory.buffer, 0, data.byteLength))
        .set(new Uint8ClampedArray(data, 0, data.byteLength), 0)

      const ptr_data = 0;
      const ptr_result = data.byteLength;
      const prt_misc = data.byteLength + (SITUATION_SIZE * 4);

      const situationResult = new Int32Array(memory.buffer, data.byteLength);
      const miscResult = new Int32Array(memory.buffer, data.byteLength + (SITUATION_SIZE * 4));

      // Load asm
      const loadAsm = async (scriptSrc: string) => {
        const script = await (await fetch(scriptSrc)).arrayBuffer()
        const module = await WebAssembly.compile(script)
        const instance = new WebAssembly.Instance(module, {
          env: {
            memory,
          },
        })
        return (instance.exports as any) as Abi
      }
      const funcs = await loadAsm("./main.wasm")
      for (let i = 0; i < 100; i++) {
        const cursor = 10000 + i * 100;
        funcs.getSituation(0, ptr_result, prt_misc, cursor, SITUATION_SIZE);
        console.log(miscResult.at(1));
      }
    })()
  }, [])

  return <>

  </>
}

export default App;

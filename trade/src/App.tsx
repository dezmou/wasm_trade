import React, { useEffect } from 'react';
import logo from './logo.svg';

const LINE_SIZE = 4 * 6;
const SITUATION_NBR = 4;
const SITUATION_SIZE = 100;

interface Abi {
  getSituation: (memData: number, memRresult: number, cursor: number) => void
}

function App() {
  useEffect(() => {
    ; (async () => {
      const data = await (await (await fetch("./bin/btc_tohlcv")).blob()).arrayBuffer()

      // Set memory
      const memory = new WebAssembly.Memory({
        initial: (data.byteLength / 64000) + (LINE_SIZE * SITUATION_SIZE * SITUATION_NBR)
      });
      (new Uint8ClampedArray(memory.buffer, 0, data.byteLength))
        .set(new Uint8ClampedArray(data, 0, data.byteLength), 0)

      const ptr_data = 0;
      const ptr_result = data.byteLength;

      const result = new Uint32Array(memory.buffer, data.byteLength);

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

      console.log(result.at(0));
      const res = funcs.getSituation(0, ptr_result, 5000)
      console.log(result.at(0));

    })()
  }, [])

  return <>

  </>
}

export default App;

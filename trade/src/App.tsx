import React, { useEffect } from 'react';
import logo from './logo.svg';

interface Abi {
  chien: (mem: number, cursor: number) => number
}

function App() {
  useEffect(() => {
    ; (async () => {
      const data = await (await (await fetch("./bin/btc_tohlcv")).blob()).arrayBuffer()


      // Set memory
      const memory = new WebAssembly.Memory({
        initial: (data.byteLength / 64000)
      });
      const chien = new Uint8ClampedArray(memory.buffer, 0, data.byteLength)
      const chien2 = new Uint8ClampedArray(data, 0, data.byteLength)
      chien.set(chien2, 0)

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

      const res = funcs.chien(0, 1)
      console.log(res);
    })()
  }, [])

  return <>

  </>
}

export default App;

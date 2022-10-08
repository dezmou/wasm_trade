import React, { useEffect } from 'react';
import logo from './logo.svg';
import { init } from "./engine"

function App() {
  useEffect(() => {
    ; (async () => {
      const engine = await init();
      const res = engine.funcs.getSituation(5)
      console.log(res);

    })()
  }, [])

  return <>

  </>
}

export default App;

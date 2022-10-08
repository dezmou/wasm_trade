export const LINE_SIZE = 4 * 6;
export const SITUATION_SIZE = 100;
export const SITUATION_AMOUNT = 4;
export const SITUATION_STEP = 5;

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
    resMax: 0,
    resMin: 0,
}

export const init = async () => {
    const data = await (await (await fetch("./bin/btc_tohlcv")).blob()).arrayBuffer()

    // Set memory
    const memory = new WebAssembly.Memory({
        initial: (data.byteLength / 64000) + (SITUATION_SIZE * 4) + (Object.keys(misc).length * 4)
    });
    (new Uint8ClampedArray(memory.buffer, 0, data.byteLength))
        .set(new Uint8ClampedArray(data, 0, data.byteLength), 0)

    const ptr_data = 0;
    const ptr_result = data.byteLength;
    const ptr_misc = data.byteLength + (SITUATION_SIZE * 4);

    const situationResult = new Int32Array(memory.buffer, data.byteLength, (SITUATION_SIZE));
    const miscResult = new Int32Array(memory.buffer, data.byteLength + (SITUATION_SIZE));

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
    const funcs = await loadAsm("./main.wasm");

    const getSituation = (cursor: number) => {
        funcs.getSituation(0, ptr_result, ptr_misc, cursor, SITUATION_SIZE)
        return {
            sit: situationResult,
            max: miscResult[0],
            min: miscResult[1],
        }
    }

    return {
        data,
        funcs: {
            getSituation
        },
    }
}
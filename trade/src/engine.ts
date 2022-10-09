export const LINE_SIZE = 6;
export const SITUATION_SIZE = 100;
export const MIN_CURSOR = 1_000_000

const SIZE_INT = 4

interface Abi {
    searchPump: (
        memData: number,
        memRresult: number,
        misc: number,
        cursor: number,
        // situationSize: number
    ) => number

    getPumpPercent: (
        memData: number,
        memRresult: number,
        misc: number,
        cursor: number,
    ) => void
}

const misc = {
    isWin: 0,
    resMin: 0,
}
const miscLength = (Object.keys(misc).length);

export const init = async () => {
    const data = await (await (await fetch("./bin/btc_tohlcv")).blob()).arrayBuffer()

    // Set memory
    const memory = new WebAssembly.Memory({
        initial:
            (
                (data.byteLength)
                + (SITUATION_SIZE * SIZE_INT)
                + (miscLength * SIZE_INT)
            ) / 64000
    });
    (new Uint8ClampedArray(memory.buffer, 0, data.byteLength))
        .set(new Uint8ClampedArray(data, 0, data.byteLength), 0)

    const ptr_data = 0;
    const ptr_result = data.byteLength;
    const ptr_misc = data.byteLength + (SITUATION_SIZE * SIZE_INT);

    const dataArray = new Int32Array(memory.buffer, 0, data.byteLength / SIZE_INT);
    const dataArrayFloat = new Float32Array(memory.buffer, 0, data.byteLength / SIZE_INT);
    const situationResult = new Int32Array(memory.buffer, data.byteLength, (SITUATION_SIZE));
    const miscResult = new Int32Array(memory.buffer, data.byteLength + (SITUATION_SIZE * SIZE_INT), miscLength);

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

    const getPumpPercent = (cursor: number) => {
        funcs.getPumpPercent(0, ptr_result, ptr_misc, cursor)
        return {
            situationResult,
            isWin: miscResult.at(0),
            changePercent: miscResult.at(1),
        };
    }

    const searchPump = (cursor: number) => {
        const res = funcs.searchPump(0, ptr_result, ptr_misc, cursor)
        return {
            cursorRes: res,
        }
    }

    return {
        data: dataArray,
        getLine: (cursor: number) => {
            return {
                time: dataArray[cursor * LINE_SIZE],
                open: dataArrayFloat[cursor * LINE_SIZE + 1],
                high: dataArrayFloat[cursor * LINE_SIZE + 2],
                low: dataArrayFloat[cursor * LINE_SIZE + 3],
                close: dataArrayFloat[cursor * LINE_SIZE + 4],
                volume: dataArrayFloat[cursor * LINE_SIZE + 5],
            }
        },
        funcs: {
            searchPump,
            getPumpPercent
        },
    }
}
# with open("./data/bitfinex_api_ETHUSD_1m.csv") as f:
#     res = f.read().split("\n")[1:]
# last = 0
# print (len(res))
# i = -1
# for line in res:
#     i = i + 1
#     # if i < 3071885:
#     #     continue
#     sp = line.split(",")
#     time = int(sp[0])
#     print(last - time)
#     last = time

import struct

# unix,date,symbol,open,high,low,close,Volume BTC,Volume USD

with open("./data/bitfinex_api_BTCUSD_1m.csv") as f:
    final = ""
    with open("./trade/public/bin/btc_tohlcv", "wb") as ff:
        lines = f.read().split("\n")[1:][:-1]
        # lines.reverse()
        for i in range(0, len(lines)):
            line = lines[i]
            try:
                if (line == ""):
                    break
                data = line.split(",")
                
                time = int(data[0])
                open = float(data[1])
                high = float(data[2])
                low = float(data[3])
                close = float(data[4])
                volume = float(data[5])
                # ff.write(struct.pack("qddddd", time, open, high, low, close,volume))
                ff.write(struct.pack("Ifffff", time, open, high, low, close,volume))

            except Exception as e:
                print (data[0])
                print (e)
                break
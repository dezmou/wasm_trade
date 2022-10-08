// #include <stdlib.h>

typedef struct  data {
    int time;
    float open;
    float close;
    float high;
    float low;
    float volume;
} Data;

typedef struct  result {
    int close;
} Result;

typedef struct  misc {
    int max;
    int min;
} Misc;

void getSituation(Data *data, Result *res, Misc * misc, int cursor, int situationSize) {
    int max = 0;
    int min = 999999;
    for (int i=0; i< situationSize; i++){
        res[i].close =  (int)((data[cursor + i].close / data[cursor + i + 1].close * 10000));
        if (res[i].close < min) {
            min = res[i].close;
        }
        if (res[i].close > max) {
            max = res[i].close;
        }
        misc->min = min;
        misc->max = max;
    }
}
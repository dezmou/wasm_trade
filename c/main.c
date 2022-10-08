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

int getSituation(Data *data, Result *res, Misc * misc, int cursor) {
    for (int i=0; i< 1000; i++){
        res[i].close =  (int)((data[cursor + i].close / data[cursor + i + 5].close * 10000));
        if (res[i].close > 10100){
            return cursor + i;
        }
    }
    return -1;
}
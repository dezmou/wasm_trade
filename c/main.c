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
    for (int i=0; i< 10000000; i++){
        int move = (int)(10000 - (data[cursor + i].close / data[cursor + i + 5].close * 10000));
        if (move > 100){
            return cursor + i;
        }
    }
    return -1;
}
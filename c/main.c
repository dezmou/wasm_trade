typedef struct  data {
    int time;
    float open;
    float close;
    float high;
    float low;
    float volume;
} Data;

typedef struct result {
    int close;
} Result;

typedef struct  misc {
    int isWin;
    int changePercent;
} Misc;

#define WIN_CHANGE 37
#define IS_PUMP 90

// void getPumpData(Data *data, Result *res, Misc * misc, int cursor){

// }

int isWin(Data *data, Result *res, Misc * misc, int cursor) {
    float initialCheck = data[cursor].close;
    for (int i=1; i<50;i++) {
        int chien = (int)(10000 - (initialCheck / data[cursor + i].close * 10000));
        if (chien < -WIN_CHANGE) {
            return 1;
        }
        if (chien > WIN_CHANGE){
            return 0;
        }
    }
    return 0;
}

void getPercents(Data *data, Result *res, Misc * misc, int cursor, int endCursor) {
    float initial = data[cursor].close;
    int i = 0;
    for (; cursor <= endCursor ; cursor++) {
        res[i].close =  (int)(10000 - (initial / data[cursor].close * 10000));
        i += 1;
    }
}

int searchPump(Data *data, Result *res, Misc * misc, int cursor) {
    for (int i=0; i< 10000000; i++){
        int move = (int)(10000 - (data[cursor + i - 5].close / data[cursor + i].close * 10000));
        if (move > IS_PUMP){
            return cursor + i;
        }
    }
    return -1;
}
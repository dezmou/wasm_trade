
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

void getPumpPercent(Data *data, Result *res, Misc * misc, int cursor){
    float initial = data[cursor - 50].close;
    float initialCheck = data[cursor].close;
    for (int i=0; i<100;i++) {
        res[i].close =  (int)(10000 - (initial / data[cursor + i - 50].close * 10000));
    }
    for (int i=1; i<50;i++) {
        int chien = (int)(10000 - (initialCheck / data[cursor + i].close * 10000));
        if (chien < -50) {
            misc->isWin = 1;
            misc->changePercent = chien;
            return;
        }
        if (chien > 50){
            misc->isWin = 0;
            misc->changePercent = chien;
            return;
        }
    }
    misc->isWin = 0;
    misc->changePercent = -1;
}

int searchPump(Data *data, Result *res, Misc * misc, int cursor) {
    for (int i=0; i< 10000000; i++){
        int move = (int)(10000 - (data[cursor + i - 5].close / data[cursor + i].close * 10000));
        if (move > 110){
            return cursor + i;
        }
    }
    return -1;
}
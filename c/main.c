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
    int foundIndex;
} Misc;

void getPumpPercent(Data *data, Result *res, Misc * misc, int cursor){
    float initial = data[cursor - 50].close;
    float initialCheck = data[cursor].close;
    for (int i=0; i<100;i++) {
        res[i].close =  (int)(10000 - (initial / data[cursor + i - 50].close * 10000));
    }
    for (int i=1; i<50;i++) {
        int chien =  (int)(10000 - (initialCheck / data[cursor + i].close * 10000));
        if (chien < 0) {
            misc->isWin = 1;
        }else {
            misc->isWin = 0;
        }
        break;
    }

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
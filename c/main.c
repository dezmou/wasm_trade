typedef struct  data {
    int time;
    float open;
    float close;
    float high;
    float low;
    float volume;
} Data;

void getSituation(Data *data, int *res, int cursor) {
    res[0] = 55;
}
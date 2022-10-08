#include <stdio.h>

typedef struct  data {
    int time;
    float open;
    float close;
    float high;
    float low;
    float volume;
} Data;

float chien(Data *data, int cursor){
    return data[cursor].open;
}
// dichiaro una matrice, gli '0' sono muri, gli '1' sono spazi liberi nel labirinto
#define RAW 24
#define COLUMNS 24
#define dimX 10
#define dimY 11
#include "GLCD.h"
#include "RIT/RIT.h"

//pacman x=13 y=18
extern volatile int Matrice[RAW][COLUMNS];

void updatepackman(int x,int y);
int checkmatrix(int x,int y);
int checkLifes(int punteggio,int vite);
void fillPillMatrix();
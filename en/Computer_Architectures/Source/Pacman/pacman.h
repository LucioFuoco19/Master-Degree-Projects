#ifndef __PACMAN_H__
#define __PACMAN_H__

#include "GLCD.h"
#include <stdlib.h>
#include <stdio.h>
#include "timer.h"
#include "JOYSTICK/joystick.h"
#include "RIT/RIT.h"
#include "Ghost/Ghost.h"
#include "Music/music.h"
#include "CAN/CAN.h"
#define RIGHE 24
#define COLONNE 24

#define dimX 10
#define dimY 11

typedef volatile struct{
uint16_t x;
uint16_t y;
int NumVite;
int score;
int atecoins;
int tempo;
}pacman;

void start_pacman(void);
pacman CreatePacman(uint16_t x, uint16_t y);
void updatepackman(pacman *p,int x,int y);
void RefreshStats(pacman p);
int checkLifes(int punteggio);
int checkmatrix(int x,int y);
void delay(int milliseconds);
void fillPillMatrix();
void RefreshStatsP(pacman *p);
void GeneratePPill(void);
void checkWin(void);
void HandleCountdown(void);
void checkEat(void);
void ripristinaMatr(int x,int y);
int checkMovement(int x,int y);
void WriteCan(void);
//graphic.c
void DrawSquare8x8(uint16_t Xpos, uint16_t Ypos, uint16_t color);
void DrawCircle4x4(uint16_t Xpos, uint16_t Ypos, uint16_t color);
void DrawPacman(uint16_t Xpos, uint16_t Ypos, uint16_t color);
void ClearPacman(uint16_t Xpos, uint16_t Ypos, uint16_t bkColor);
void drawLabirinth(int Matrice[RIGHE][COLONNE]);
void countdown();
void drawSquare(int x, int y, int size);
void GLCD_DrawRectangle(int x1, int y1, int x2, int y2);
void fillRectangle(int x1, int y1, int x2, int y2, uint16_t color);
void Gameover(void);
void pause_funct(void);
void resume(void);
void Win(void);
void lockBase(void);
void unlockBase(void);
void DrawCircle8x8(uint16_t Xpos, uint16_t Ypos, uint16_t color);
void DrawGate(uint16_t Xpos, uint16_t Ypos, uint16_t color);
#endif
#ifndef GHOST_H
#define GHOST_H

#include "Pacman/pacman.h"
#include "GLCD.h"
#include <string.h>
#include "timer.h"
#include <math.h>
#define CHASE 1
#define FRIGHTENED 2
typedef volatile struct{
uint16_t x;
uint16_t y;
uint16_t predX;
uint16_t predY;
int mode;
int time1;
int time2;
int tdead; 
}ghost;

ghost CreateGhost(uint16_t x, uint16_t y);
void initializeGhost(void);
void updateGhostPos(ghost *g,uint16_t x, uint16_t y);
void moveGhostChase(ghost *g,uint16_t xpac,uint16_t ypac);
void setGhost(int tempo);
void moveGhostFrightened(ghost *g,uint16_t xpac,uint16_t ypac);
void respawnGhost(void);

//graph.h
void DrawGhost(uint16_t Xpos, uint16_t Ypos, uint16_t color);
void DeleteGhost(uint16_t Xpos, uint16_t Ypos);
#endif
#include "Ghost.h"
ghost CreateGhost(uint16_t x, uint16_t y){
ghost g; 
g.x=x;
g.y=y;
g.predX=-1;
g.predY=-1;
g.mode=CHASE;
g.time1=0;
g.tdead=0;
g.time2=0;
return g;
}
extern pacman p;
extern int morto;
extern int uscito;
ghost g;
void initializeGhost(void){
g=CreateGhost(10,12);
DrawGhost(g.y*DimensioneX,(g.x*DimensioneY)+20,Red);
}

void updateGhostPos(ghost *g,uint16_t x, uint16_t y){
g->predX=g->x;
g->predY=g->y;
g->x=x;
g->y=y;
}
void setGhost(int tempo){ //gestisco aggressività ghost
	if(tempo==50){
			disable_timer(1);
			init_timer(1,0x00e4e1c0);//600 ms * 25 Mhz
			if(morto!=1)enable_timer(1);
	}else if(tempo==40){
			disable_timer(1);
			init_timer(1,0x00bebc20);//500 ms * 25 Mhz
			if(morto!=1)enable_timer(1);
	}else if(tempo==30){
			disable_timer(1);
			init_timer(1,0x00989680);//400 ms * 25 Mhz
			if(morto!=1)enable_timer(1);
	}else if(tempo==20){
			disable_timer(1);
			init_timer(1,0x007270e0);//300 ms * 25 Mhz
			if(morto!=1)enable_timer(1);
	}else if(tempo==10){
			disable_timer(1);
			init_timer(1,0x004c4b4); //200 ms * 25 Mhz
			if(morto!=1)enable_timer(1);
	}
}
void moveGhostChase(ghost *g,uint16_t xpac, uint16_t ypac){ //ghost insegue pacman
	//possibili direzioni di movimento su,giu,dx,sx
	int dx[]={-1,1,0,0};
	int dy[]={0,0,-1,1};
	int bestX=g->x;
	int bestY=g->y;
	int distanzaMinima=100000; //valore random molto alto
	
	//calcola la distanza per ogni possibile movimento valido
	for(int i=0;i<4;i++){
			int newX=g->x+dx[i];
			int newY=g->y+dy[i];
			if((newX!=g->predX)||(newY!=g->predY)){
					if(checkMovement(newX,newY))
					{
							int distanza=abs(xpac-newX)+abs(ypac-newY);
							//aggiorno il miglior movimento
							if(distanza<distanzaMinima)
							{
								distanzaMinima=distanza;
								bestX=newX;
								bestY=newY;
							}
					}
		}
	}
	//aggiornamento posizione del fantasma (guarda migliore X e migliore Y)
	DeleteGhost(g->y*DimensioneX,(g->x*DimensioneY)+20);
	ripristinaMatr(g->x,g->y);
	updateGhostPos(g,bestX,bestY);
	DrawGhost(g->y*DimensioneX,(g->x*DimensioneY)+20,Red);
}

void moveGhostFrightened(ghost *g,uint16_t xpac,uint16_t ypac){ //ghost scappa da pacman
int dx[]={-1,1,0,0};
	int dy[]={0,0,-1,1};
	int bestX=g->x;
	int bestY=g->y;
	int distanzaMassima=0; //valore random molto alto
	
	//calcola la distanza per ogni possibile movimento valido
	for(int i=0;i<4;i++){
			int newX=g->x+dx[i];
			int newY=g->y+dy[i];
			if((newX!=g->predX)||(newY!=g->predY)){
			if(checkMovement(newX,newY)){
				int distanza=abs(xpac-newX)+abs(ypac-newY);
				
				//aggiorno il miglior movimento
					if(distanza>distanzaMassima)
					{
						distanzaMassima=distanza;
						bestX=newX;
						bestY=newY;
					}
			}
	}
}
	//aggiornamento posizione del fantasma (guarda migliore X e migliore Y)
	DeleteGhost(g->y*DimensioneX,(g->x*DimensioneY)+20);
	ripristinaMatr(g->x,g->y);
	updateGhostPos(g,bestX,bestY);
	DrawGhost(g->y*DimensioneX,(g->x*DimensioneY)+20,Blue2);
}


void respawnGhost(void){
		morto=0;
		uscito=0;
		unlockBase();
		enable_timer(1);
		DrawGhost(g.y*DimensioneX,(g.x*DimensioneY)+20,Red);

}
//graph part
void DrawGhost(uint16_t Xpos, uint16_t Ypos, uint16_t color) {
    int centerX = Xpos + DimensioneX / 2; // Centro sull'asse X
    int radius = DimensioneX / 2;         // Raggio della parte superiore del fantasmino
    int y, x;

    // Disegna la parte superiore arrotondata del fantasmino (semicerchio)
    for (y = Ypos; y < Ypos + radius; y++) {
        for (x = Xpos; x < Xpos + DimensioneX; x++) {
            int dx = x - centerX;
            int dy = y - Ypos;
            int distanceSquared = dx * dx + dy * dy;

            // Disegna solo i punti che appartengono alla semisfera
            if (distanceSquared <= radius * radius) {
                LCD_SetPoint(x, y, color);
            }
        }
    }

    // Disegna il corpo rettangolare del fantasmino
    for (y = Ypos + radius; y < Ypos + DimensioneY; y++) {
        for (x = Xpos; x < Xpos + DimensioneX; x++) {
            LCD_SetPoint(x, y, color);
        }
    }

    // Disegna la parte inferiore ondulata del fantasmino
    int waveHeight = 5; // Altezza delle ondulazioni
    int waveWidth = DimensioneX / 4; // Larghezza di ogni onda

    for (x = Xpos; x < Xpos + DimensioneX; x++) {
        int offset = (x - Xpos) / waveWidth % 2 == 0 ? 0 : waveHeight;

        for (y = Ypos + DimensioneY - waveHeight + offset; y < Ypos + DimensioneY; y++) {
            LCD_SetPoint(x, y, 0x0000); // Usa il colore di sfondo per "ritagliare" l'onda
        }
    }
}

void DeleteGhost(uint16_t Xpos, uint16_t Ypos) {
    for (int y = Ypos; y < Ypos + DimensioneY; y++) {
        for (int x = Xpos; x < Xpos + DimensioneX; x++) {
            LCD_SetPoint(x, y, 0x0000); // Riempie con nero (colore RGB 0x0000)
        }
    }
}


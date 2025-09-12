#include "pacman.h"
extern int direzione;
extern ghost g;
extern int morto;
extern int vinto;
extern int SuperPillMangiata;
extern int MusicEat;
pacman CreatePackman(uint16_t x,uint16_t y){
pacman pac;
pac.x=x;
pac.y=y;
pac.score=0;
pac.NumVite=1;
pac.atecoins=0;
pac.tempo=60;
return pac;
}


int Matrice[RIGHE][COLONNE]=			 {{1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
																		{1,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,1},
																		{1,0,1,1,0,1,1,1,1,0,1,1,1,0,1,1,1,1,0,1,1,1,0,1},
																		{1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
																		{1,0,1,1,1,0,1,0,1,1,1,1,1,1,1,1,0,1,0,1,1,1,0,1},
																		{1,0,1,1,1,0,1,0,1,1,1,1,1,1,1,1,0,1,0,1,1,1,0,1},
																		{1,0,0,0,0,0,1,0,0,0,0,1,1,0,0,0,0,1,0,0,0,0,0,1},
																		{1,0,1,1,1,0,1,1,1,1,0,1,1,0,1,1,1,1,0,1,1,1,0,1},
																		{1,0,1,1,1,0,1,2,2,2,2,2,2,2,2,2,2,1,0,1,1,1,0,1},
																		{1,0,0,0,0,0,1,2,1,1,1,2,2,1,1,1,2,1,0,0,0,0,0,1},
																		{1,1,0,1,1,0,1,2,1,2,2,2,2,2,2,1,2,1,0,1,1,1,1,1},
																		{0,0,0,0,0,0,0,2,1,2,2,2,2,2,2,1,2,0,0,0,0,0,0,0},
																		{1,1,1,1,1,0,1,2,1,1,1,1,1,1,1,1,2,1,0,1,1,1,1,1},
																		{1,0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0,1},
																		{1,0,1,1,1,0,1,1,0,1,1,1,1,1,1,0,1,1,0,1,1,1,0,1},
																		{1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1},
																		{1,0,1,1,1,0,1,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,1},
																		{1,0,1,1,1,0,1,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,1},
																		{1,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,1,0,0,0,1},
																		{1,1,1,0,1,0,1,0,1,1,0,1,1,0,1,1,0,1,0,1,0,1,1,1},
																		{1,0,0,0,0,0,1,0,0,0,0,1,1,0,0,0,0,1,0,0,0,0,0,1},
																		{1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1},
																		{1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
																		{1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1}};
												
pacman p;

int mangiato;		
int pillole[6];
void start_pacman(void){
		LCD_Clear(Black);
		p = CreatePackman(18,12);
		drawLabirinth(Matrice);
		RefreshStats(p);
		DrawPacman(p.y*DimensioneX,(p.x*DimensioneY)+20,Yellow);
		fillPillMatrix();
		initializeGhost();
};

void updatepackman(pacman *p,int x,int y){
	mangiato=0;
	switch(checkmatrix(x,y))
		{
		case 0: //moneta
				ClearPacman(p->y*DimensioneX,((p->x*DimensioneY)+20),Black);
				p->x=x;
				p->y=y;
				p->score+=10;
				p->atecoins++;
				checkWin();
				if(checkLifes(p->score,p->NumVite)){
					p->NumVite++;
				}
				RefreshStatsP(p);
				DrawPacman(p->y*DimensioneX,((p->x*DimensioneY)+20),Yellow);
				break;
		case 2: // casella vuota
				ClearPacman(p->y*DimensioneX,((p->x*DimensioneY)+20),Black);
				p->x=x;
				p->y=y;
				RefreshStatsP(p);
				DrawPacman(p->y*DimensioneX,((p->x*DimensioneY)+20),Yellow);
				break;
		case 3: //superpill
				ClearPacman(p->y*DimensioneX,((p->x*DimensioneY)+20),Black);
				p->x=x;
				p->y=y;
				p->score+=50;
				p->atecoins++;
				g.mode=FRIGHTENED;
				if(checkLifes(p->score,p->NumVite)){
					p->NumVite++;
				}
				RefreshStatsP(p);
				DrawPacman(p->y*DimensioneX,((p->x*DimensioneY)+20),Yellow);
				mangiato=1;
				SuperPillMangiata=1;
				checkWin();
				break;
		case 1: //muro
				direzione=0; //se va a muro non fare alcuna mossa aggiuntiva
				RefreshStatsP(p);
				break;
		case -1: //teletrasporto da sx verso dx
					ClearPacman(p->y*DimensioneX,((p->x*DimensioneY)+20),Black);
					//p.x resta la stessa
					p->y=23;
					if(Matrice[p->x][p->y]==0){ //caso in cui ci passo la prima volta e c'é una moneta normale
							p->score+=10;
							p->atecoins++;
						checkWin();
							Matrice[p->x][p->y]=-1;
					}else if(Matrice[p->x][p->y]==3){//caso in cui ci passo la prima volta e c'é una superpill
							p->score+=50;
							p->atecoins++;
							checkWin();
							Matrice[p->x][p->y]=-1;
					}
					if(checkLifes(p->score,p->NumVite)){
						p->NumVite++;
					}
					RefreshStatsP(p);
					DrawPacman(p->y*DimensioneX,((p->x*DimensioneY)+20),Yellow);
			break;
		case 24: //teletrasporto da dx verso sx
					ClearPacman(p->y*DimensioneX,((p->x*DimensioneY)+20),Black);
					//p.x resta la stessa
					p->y=0;
					if(Matrice[p->x][p->y]==0){ //caso in cui ci passo la prima volta e c'é una moneta normale
							p->score+=10;
							p->atecoins++;
							Matrice[p->x][p->y]=-1;
					}else if(Matrice[p->x][p->y]==3){//caso in cui ci passo la prima volta e c'é una superpill
							p->score+=50;
							p->atecoins++;
							Matrice[p->x][p->y]=-1;
					}
					if(checkLifes(p->score,p->NumVite)){
						p->NumVite++;
					}
					RefreshStatsP(p);
					DrawPacman(p->y*DimensioneX,((p->x*DimensioneY)+20),Yellow);
			break;
		default:
			
		break;
		
	}
}
int checkLifes(int punteggio,int vite){
int div;
	div=punteggio/1000;
	if(div>(vite-1)) return 1;
	return 0;
}

void RefreshStats(pacman p){

		char stringa[35];
		char vite[35];
		sprintf(stringa, "SCORE:%d|GAME ENDS IN %d s",p.score,p.tempo);
		if(p.tempo<10){
				sprintf(stringa, "SCORE:%d|GAME ENDS IN  %d s",p.score,p.tempo);
		}
		sprintf(vite, "|VITE RIMANENTI:%d|",p.NumVite);
		GUI_Text(0, 0, (uint8_t *)stringa ,White,Blue);  //generano un offset di 16
		GUI_Text(0, 304, (uint8_t *)vite ,White,Blue); 
}

int checkmatrix(int x,int y){
	int flag=-2,update=0;
if((x<=RIGHE)&&(y<COLONNE)){
		if((x>=0)&&(y>=0)){
			if(Matrice[x][y]==1){ //caso di muro
				 return flag=1;
			}else if(Matrice[x][y]==3){ //caso di 'supermoneta'
				Matrice[x][y]=-1; //faccio in modo che segni la cella come 'gia mangiata'
				flag=3;
				update++;
			}else if(Matrice[x][y]==0){ //caso di moneta 
				Matrice[x][y]=-1;
				flag=0;
				update++;
			}else if(((Matrice[x][y]==2)||(Matrice[x][y]==-1))&&update==0){ //caso in cui si passa su una cella senza moneta/gia mangiata
				flag=2;
				update++;
			}else if(Matrice[x][y]==4){
				flag=4;
				update++;
			}
		}else if(y==-1){// caso teleport da sx verso dx
			flag=-1;
			return flag;
		}
}else if(y==COLONNE){ //caso teleport da dx verso sx
flag=24;
return flag;
}
return flag;
}

void fillPillMatrix(){
	for(int i=0;i<6;i++)pillole[i]=(rand()%56)+5;
}

// Funzione per delay in millisecondi
void delay(int milliseconds){
    // Funzione di delay basata su un ciclo
    volatile long int i;
    for (i = 0; i < milliseconds * 1000; i++);
}
void ripristinaMatr(int x,int y){
int valore;
valore=Matrice[x][y];
if(valore==0){
DrawCircle8x8(y*DimensioneX,(x*DimensioneY)+20,Yellow);
}else if((valore==2)||(valore==-1)){
DrawSquare8x8(y*DimensioneX,(x*DimensioneY)+20,Black);
}else if(valore==3){
DrawCircle4x4(y*DimensioneX,(x*DimensioneY)+20,Magenta);
}
}

void resume(void){
LCD_Clear(Black);
drawLabirinth(Matrice);
DrawPacman(p.y*DimensioneX,(p.x*DimensioneY)+20,Yellow);
RefreshStats(p);
if(g.mode==1)DrawGhost(g.y*DimensioneX,(g.x*DimensioneY)+20,Red);
if(g.mode==2)DrawGhost(g.y*DimensioneX,(g.x*DimensioneY)+20,Blue2);

}

void RefreshStatsP(pacman *p){

		char stringa[35];
		char vite[35];
		sprintf(stringa, "SCORE:%d|GAME ENDS IN %d s",p->score,p->tempo);
		if(p->tempo<10){
		sprintf(stringa, "SCORE:%d|GAME ENDS IN  %d s",p->score,p->tempo);
		}
		sprintf(vite, "|VITE RIMANENTI:%d|",p->NumVite);
		GUI_Text(0, 0, (uint8_t *)stringa ,White,Blue);  //generano un offset di 16
		GUI_Text(0, 304, (uint8_t *)vite ,White,Blue); 
}

void GeneratePPill(void){
int x,y,p=0;
while(p<1){
		y=rand()%RIGHE;
		x=rand()%COLONNE;
		if(Matrice[x][y]==0){
			Matrice[x][y]=3;
			DrawCircle4x4((y*DimensioneX),(x*DimensioneY)+20,Magenta); //offset necessario
			p++;
		}
	}
}

void checkWin(void){
if(p.atecoins==240){
disable_timer(0);
disable_timer(1);
vinto=1;
Win();
}
}
void HandleCountdown(void){ //gestore countdown e aumenta aggressività ghost
if(p.tempo>0){
		p.tempo--;
		RefreshStats(p);
	}
	for(int i=0;i<6;i++){
		if(pillole[i]==p.tempo)GeneratePPill();
	}
	if(p.tempo==0){
		disable_timer(1);
		disable_timer(0);
		vinto=-1;

		Gameover();	
		
}
	if((p.tempo%10)==0)setGhost(p.tempo); // utilizzata per regolare l'aggressività del fantasma
}
void lockBase(void){
 Matrice[9][12]=4;
 Matrice[9][11]=4;
DrawGate(12*DimensioneX,(9*DimensioneY)+20,Green);
DrawGate(11*DimensioneX,(9*DimensioneY)+20,Green);
}
void unlockBase(void){
 Matrice[9][12]=-1;
 Matrice[9][11]=-1;
DrawSquare8x8(12*DimensioneX,(9*DimensioneY)+20,Black);
DrawSquare8x8(11*DimensioneX,(9*DimensioneY)+20,Black);
}

void checkEat(void){
	if(g.mode==1){ //caso fantasma mangia pacman
			if((g.x==p.x)&&(g.y==p.y)){ //se le coordinate combaciano
						DeleteGhost(g.y*DimensioneX,(g.x*DimensioneY+20));
						ClearPacman(p.y*DimensioneX,(p.x*DimensioneY)+20,Black);
					p.NumVite--;
					MusicEat=-1;
					if(p.NumVite==0){ //caso gameover
								disable_timer(0);
								disable_timer(1);
								vinto=-1;
								Gameover();
					}else if(p.NumVite>0){ //caso respawn
						delay(1000);
						disable_timer(1);
								g.x=10;
								g.y=12;
								direzione=0;
								p.x=18;
								p.y=12;
								respawnGhost();
								DrawPacman(p.y*DimensioneX,(p.x*DimensioneY)+20,Yellow);
					}
	}
		}else if(g.mode==2){
				if((g.x==p.x)&&(g.y==p.y)){// caso pacman mangia fantasma
					DeleteGhost(g.y*DimensioneX,(g.x*DimensioneY+20));
					updateGhostPos(&g,10,12);
					DrawPacman(p.y*DimensioneX,(p.x*DimensioneY)+20,Yellow);
					p.score=p.score+100;
					morto=1;
					disable_timer(1);
						MusicEat=1;
					}
	}	
}

int checkMovement(int x,int y){
  int valore=Matrice[x][y];
	if((valore==1)||(valore==4))return 0;
	return 1;
}
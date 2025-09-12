/*********************************************************************************************************
**--------------File Info---------------------------------------------------------------------------------
** File name:           IRQ_RIT.c
** Last modified Date:  2014-09-25
** Last Version:        V1.00
** Descriptions:        functions to manage T0 and T1 interrupts
** Correlated files:    RIT.h
**--------------------------------------------------------------------------------------------------------
*********************************************************************************************************/
#include "LPC17xx.h"
#include "RIT.h"
#include "GLCD.h"
#include "Pacman/pacman.h"
#include "JOYSTICK/joystick.h"
#include "Music/music.h"
#include "CAN/CAN.h"
extern pacman p;
extern ghost g;
extern int mangiato;
/******************************************************************************
** Function name:		RIT_IRQHandler
**
** Descriptions:		REPETITIVE INTERRUPT TIMER handler
**
** parameters:			None
** Returned value:		None
**
******************************************************************************/
/* OCCORE DICHIARARLE GLOBALI IN QUANTO CONDIVISE CON I BUTTON
*/
volatile int INT0=0;
volatile int KEY1=0; 
volatile int KEY2=0;
int volte=0;
int flag=0;
int direzione=0;
int uscito=0;
int counter=0;
int ghostCount=0;
int morto=0;
int deadCount=0;
int countWin=0;
int vinto=0;
int countLost=0;
int SuperPillMangiata=0;
int MusicEat=0;
#define UPTICKS 1
#define RIT_SEMIMINIMA 8
#define RIT_MINIMA 16
#define RIT_INTERA 32

//SHORTENING UNDERTALE: TOO MANY REPETITIONS
NOTE song[] = 
{
	// 1
	{d3, time_semicroma},
	{d3, time_semicroma},
	{d4, time_croma},
	{a3, time_croma},
	{pause, time_semicroma},
	{a3b, time_semicroma},
	{pause, time_semicroma},
	{g3, time_croma},
	{f3, time_semicroma*2},
	{d3, time_semicroma},
	{f3, time_semicroma},
	{g3, time_semicroma},
	// 2
	{c3, time_semicroma},
	{c3, time_semicroma},
	{d4, time_croma},
	{a3, time_croma},
	{pause, time_semicroma},
	{a3b, time_semicroma},
	{pause, time_semicroma},
	{g3, time_croma},
	{f3, time_semicroma*2},
	{d3, time_semicroma},
	{f3, time_semicroma},
	{g3, time_semicroma},
	// 3
	{c3b, time_semicroma},
	{c3b, time_semicroma},
	{d4, time_croma},
	{a3, time_croma},
	{pause, time_semicroma},
	{a3b, time_semicroma},
	{pause, time_semicroma},
	{g3, time_croma},
	{f3, time_semicroma*2},
	{d3, time_semicroma},
	{f3, time_semicroma},
	{g3, time_semicroma},
	// 4
	{a2b, time_semicroma},
	{a2b, time_semicroma},
	{d4, time_croma},
	{a3, time_croma},
	{pause, time_semicroma},
	{a3b, time_semicroma},
	{pause, time_semicroma},
	{g3, time_croma},
	{f3, time_semicroma*2},
	{d3, time_semicroma},
	{f3, time_semicroma},
	{g3, time_semicroma},
	// 5
	
};

NOTE startScreenSong[] = { //musica di inizio gioco
    {c4, time_minima},
    {e4, time_minima},
    {g4, time_minima},
    {c5, time_minima},
    {pause, time_minima},
    {c5, time_minima},
    {g4, time_minima},
    {e4, time_minima},
    {c4, time_minima},
};

NOTE pauseSong[] = {  //musica di pausa
    {c4, time_minima},
    {pause, time_minima},
    {e4, time_minima},
    {pause, time_minima},
    {g4, time_minima},
    {pause, time_minima},
    {e4, time_minima},
    {pause, time_minima},
};

NOTE victorySong[] = { // Musica di vittoria
    {c4, time_minima},  // C4
    {e4, time_minima},  // E4
    {g4, time_minima},  // G4
    {c5, time_minima},  // C5
    {e4, time_minima},  // E4
    {g4, time_minima},  // G4
    {a4, time_minima},  // A4
    {c5, time_minima},  // C5
    {pause, time_minima}, // Pausa
    {g4, time_minima},  // G4
    {e4, time_minima},  // E4
    {c4, time_minima},  // C4
    {pause, time_minima}, // Pausa
    {c4, time_semiminima},  // C4
    {e4, time_semiminima},  // E4
    {g4, time_semiminima},  // G4
    {c5, time_semiminima},  // C5
    {pause, time_minima}, // Pausa
};

NOTE defeatSong[] = {
    {g4, time_semicroma},
    {f4, time_semicroma},
    {e4, time_semicroma},
    {d4, time_semicroma},
    {c4, time_minima},
    {pause, time_minima},
    {c4, time_minima},
    {d4, time_minima},
};
NOTE coinEatEffect[] = { 
    {c4, time_biscroma},  // C4
    {d4, time_biscroma},  // D4
    {e4, time_biscroma},  // E4
    {pause, time_biscroma}  // Pausa breve
};

NOTE ghostEatEffect[] = { 
    {c4, time_croma},  // C4
    {e4, time_croma},  // E4
    {g4, time_croma},  // G4
    {c5, time_croma},  // C5
    {e4, time_croma},  // E4
    {g4, time_croma},  // G4
    {pause, time_biscroma}  // Pausa breve
};

NOTE ghostKillsPacmanEffect[] = { 
    {c4, time_biscroma},  // C4
    {g3, time_biscroma},  // G3
    {e3, time_biscroma},  // E3
    {d3, time_biscroma},  // D3
    {pause, time_biscroma}  // Pausa breve
};
void RIT_IRQHandler (void)
{					
	//static int position=0;	// Relativa ai led

	// VARIABILI DEL JOYSTICK
	static int up=0;
	static int down=0;
	static int left=0;
	static int right=0;
	static int sel=0;
	static int currentNote = 0;
	static int startNote=0;
	static int pauseNote=0;
	static int coinNote=0;
	static int ticks = 0;
	static int winNote=0;
	static int lostNote=0;
	static int PacEatNote=0;
	static int GhostKillNote=0;
	//static int up_left=0;
	//static int up_right=0;
	//static int down_left=0;
	//static int down_right=0;
	
	// ALTRE VARIABILI 
	
if((volte>0)&&(flag==0)){	//gestione temporale e spaziale superPills
	if(vinto==0){
			counter++;
			if((counter%20)==0)HandleCountdown();
	}
}

if((volte>0)&&(flag==0)){ //gestore speaker canzone di gioco
	if(vinto==0){
		if(!isNotePlaying()){ 
				++ticks;
				if(ticks == UPTICKS)
				{
						ticks = 0;
						playNote(song[currentNote++]);
				}
		}
	
	if(currentNote == (sizeof(song) / sizeof(song[0])))
	{
		currentNote=0;
	}
}
}

if((volte==0)&&(flag==0)){ //gestore speaker canzone di inizio
	if(vinto==0){
	if(!isNotePlaying()){ 
		++ticks;
		if(ticks == UPTICKS)
		{
			ticks = 0;
			playNote(startScreenSong[startNote++]);
		}
	}
	
	if(startNote == (sizeof(startScreenSong) / sizeof(startScreenSong[0])))
	{
		startNote=0;
	}
}
}
if ((volte>0) &&(flag==1)){ // canzone di pausa
if(vinto==0){
if(!isNotePlaying()){ 
		++ticks;
		if(ticks == UPTICKS)
		{
			ticks = 0;
			playNote(pauseSong[pauseNote++]);
		}
	}
	
	if(pauseNote == (sizeof(pauseSong) / sizeof(pauseSong[0])))
	{
		pauseNote=0;
	}
}
}
if(SuperPillMangiata==1){ //effetto superpill
	while(SuperPillMangiata!=0){
		if(!isNotePlaying()){ 
		++ticks;
		if(ticks == UPTICKS)
		{
			ticks = 0;
			playNote(coinEatEffect[coinNote++]);
		}
	}
	
	if(coinNote == (sizeof(coinEatEffect) / sizeof(coinEatEffect[0])))
	{
		coinNote=0;
		SuperPillMangiata=0;
	}
}
}
if(MusicEat==1){ //effetto pac mangia fantasma
	while(MusicEat!=0){
		if(!isNotePlaying()){ 
		++ticks;
		if(ticks == UPTICKS)
		{
			ticks = 0;
			playNote(ghostEatEffect[PacEatNote++]);
		}
	}
	
	if(PacEatNote == (sizeof(ghostEatEffect) / sizeof(ghostEatEffect[0])))
	{
		PacEatNote=0;
		MusicEat=0;
	}
}
}
if(MusicEat==-1){ //effetto fantasma uccide pacman
	while(MusicEat!=0){
		if(!isNotePlaying()){ 
		++ticks;
		if(ticks == UPTICKS)
		{
			ticks = 0;
			playNote(ghostKillsPacmanEffect[GhostKillNote++]);
		}
	}
	
	if(GhostKillNote == (sizeof(ghostKillsPacmanEffect) / sizeof(ghostKillsPacmanEffect[0])))
	{
		GhostKillNote=0;
		MusicEat=0;
	}
}
}
if(vinto==1){	//caso speaker vittoria
countWin++;
if(!isNotePlaying()){ 
		++ticks;
		if(ticks == UPTICKS)
		{
			ticks = 0;
			playNote(victorySong[winNote++]);
		}
	}
	
	if(winNote == (sizeof(victorySong) / sizeof(victorySong[0])))
	{
		winNote=0;
	}
	if(countWin==40){
		disable_RIT();
		disable_timer(2);
		disable_timer(3);
	}
}
if(vinto==-1){// caso speaker sconfitta
	countLost++;
if(!isNotePlaying()){ 
		++ticks;
		if(ticks == UPTICKS)
		{
			ticks = 0;
			playNote(defeatSong[lostNote++]);
		}
	}
	
	if(lostNote == (sizeof(defeatSong) / sizeof(defeatSong[0])))
	{
		lostNote=0;
	}
if(countLost==40){
	disable_RIT();
	disable_timer(2);
	disable_timer(3);
}
}

if((volte>0)&&(flag==0)){ //caso in cui mangio una superpill
	if(vinto==0){
		if(g.mode==1){ //fantasma cacciatore
				if(mangiato==1){ // se è stata mangiata una superPill
					g.mode=2;
					ghostCount=0;
					mangiato=0;
				}
		}else if(g.mode==2){ //fantasma preda 
				ghostCount++;
				if(mangiato==1){ //se è stata mangiata una powerpill mentre si era in modalità preda,resetta il timer
						ghostCount=0;
						g.time1=0;
						mangiato=0;
				}
				if(ghostCount%20==0){
						g.time1++;
						if(g.time1==10){ //una volta passati 10 secondi diventa cacciatore
								g.mode=1;
								mangiato=0;
								ghostCount=0;
								g.time1=0;
						}
				}
		}
}
}
if(morto==1){ //cooldown morte del fantasma
			deadCount++;
			if(deadCount%20==0)g.tdead++;
			if(g.tdead==3){
				deadCount=0;
				g.tdead=0;
				g.mode=1;
				respawnGhost();
			}
}

if((volte>0)&&(flag==0)){ //CAN
CAN_TxMsg.data[0]=(p.score & 0xFFDD)>>8;
CAN_TxMsg.data[1]= p.score & 0xFF;
CAN_TxMsg.data[2]= p.NumVite & 0xFF;
CAN_TxMsg.data[3] = p.tempo &0xFF;
CAN_TxMsg.len=4;
CAN_TxMsg.id=2;
CAN_TxMsg.format=STANDARD_FORMAT;
CAN_TxMsg.type=DATA_FRAME;
CAN_wrMsg (1,&CAN_TxMsg);
reset_RIT();
}
	/* INT0 management 
	*/
	if(INT0>=1){ 
		if((LPC_GPIO2->FIOPIN & (1<<10)) == 0){	/* INT0 pressed */
			switch(INT0){				
					case 2:						/* pay attention here: please see slides 19_ to understand value 2 */
						if((volte==0 )&& (flag==0)){//pause mode fittizia, si parte da qui
							countdown();
							start_pacman();
							volte++;
							enable_timer(0);
							enable_timer(1);
							reset_RIT();
						}else if((volte>0)&&(flag==0)){ //caso in cui si entra in pausa per davvero
								disable_timer(0);
								disable_timer(1);
							pause_funct();
							flag=1;
							reset_RIT();
					} else if ((volte>0)&&(flag==1)){ // caso di resume
							countdown();
							resume();
							flag=0;
							enable_timer(0);
							enable_timer(1);
							reset_RIT();
					}
						break;
					
					default:
						break;
			}
		INT0++;
		}else {	/* button released */
			INT0=0;
			//disable_RIT();
			//reset_RIT();
			NVIC_EnableIRQ(EINT0_IRQn);							 /* disable Button interrupts			*/
			LPC_PINCON->PINSEL4    |= (1 << 20);     /* External interrupt 0 pin selection */
		}
	}

	/* KEY1 management
	
	
	
		if(KEY1>=1){ 
		if((LPC_GPIO2->FIOPIN & (1<<11)) == 0){	// KEY1 pressed 
			switch(KEY1){				
				case 2:				// pay attention here: please see slides 19_ to understand value 2 
			
				
				IMPLEMENTA QUI COSA FARE 
				
				
				
				default:
					break;
			}
			KEY1++;
		}
		else {	// button released 
			KEY1=0;			
			NVIC_EnableIRQ(EINT1_IRQn);							 // enable Button interrupts			
			LPC_PINCON->PINSEL4    |= (1 << 22);     // External interrupt 0 pin selection 
		}
	}
	*/	
	/* KEY2 management
	
		if(KEY2>=1){ 
		if((LPC_GPIO2->FIOPIN & (1<<12)) == 0){	// KEY2 pressed 
			switch(KEY2){				
				case 2:				// pay attention here: please see slides 19_ to understand value 2 
				
				
				//IMPLEMENTA QUI COSA FARE 
				
				
				
				default:
					break;
			}
			KEY2++;
		}
		else {	// button released 
			KEY2=0;			
			NVIC_EnableIRQ(EINT2_IRQn);							 //enable Button interrupts			
			LPC_PINCON->PINSEL4    |= (1 << 24);     // External interrupt 0 pin selection 
		}
	}
	*/
	/* ******************************************************************************************************************************************************************************************* */
	/* ******************************************************************************************************************************************************************************************* */
	/* ******************************************************************************************************************************************************************************************* */
	
	
	
	/* UP management
	*/
	if((LPC_GPIO1->FIOPIN & (1<<29)) == 0){	
		/* Joytick UP pressed */
		up++;
		switch(up){
			case 1:		
				direzione=1; //va su
				break;
			case 60:	//3sec = 3000ms/50ms = 60 (Valore modificabile)
				/*
				INSERISCI QUI LA TUA FUNZIONE
				*/
				break;
			default:
				break;
		}
	}
	else{
			up=0;
	}
	
	
		
	/* DOWN management
	*/
	if((LPC_GPIO1->FIOPIN & (1<<26)) == 0){	
		/* Joytick DOWN pressed */
		down++;
		switch(down){
			case 1:
				direzione=2; // va giu
				break;
			case 60:	//3sec = 3000ms/50ms = 60 (Valore modificabile)
				/*
				INSERISCI QUI LA TUA FUNZIONE
				*/
				break;
			default:
				break;
		}
	}
	else{
			down=0;
	}
	
	
	
	
	/* RIGHT management
	*/
	if((LPC_GPIO1->FIOPIN & (1<<28)) == 0){	
		/* Joytick RIGHT pressed */
		right++;
		switch(right){
			case 1:
				 direzione=3;
				break;
			case 60:	//3sec = 3000ms/50ms = 60 (Valore modificabile)
				/*
				INSERISCI QUI LA TUA FUNZIONE
				*/
				break;
			default:
				break;
		}
	}
	else{
			right=0;
	}
	
	
	
	
	
	/* LEFT management
	*/
	if((LPC_GPIO1->FIOPIN & (1<<27)) == 0){	
		/* Joytick LEFT pressed */
		left++;
		switch(left){
			case 1:
				direzione=4; // va a sx
				break;
			case 60:	//3sec = 3000ms/50ms = 60 (Valore modificabile)
				/*
				INSERISCI QUI LA TUA FUNZIONE
				*/
				break;
			default:
				break;
		}
	}
	else{
			left=0;
	}
	
	
	/* SEL management
	*/
	if((LPC_GPIO1->FIOPIN & (1<<25)) == 0){	
		/* Joytick SEL pressed */
		sel++;
		switch(sel){
			case 1:
				/*
				INSERISCI QUI LA TUA FUNZIONE
				*/
				break;
			case 60:	//3sec = 3000ms/50ms = 60 (Valore modificabile)
				/*
				INSERISCI QUI LA TUA FUNZIONE
				*/
				break;
			default:
				break;
		}
	}
	else{
			sel=0;
	}
	
	
	/* UP-LEFT management
	
		if(((LPC_GPIO1->FIOPIN & (1<<29)) == 0) & (LPC_GPIO1->FIOPIN & (1<<27)) == 0){	
		 Joytick SEL pressed 
		up_left++;
		switch(up_left){
			case 1:
				
				//INSERISCI QUI LA TUA FUNZIONE
				
				break;
			case 60:	//3sec = 3000ms/50ms = 60 (Valore modificabile)
				
			//	INSERISCI QUI LA TUA FUNZIONE
				
				break;
			default:
				break;
		}
	}
	else{
			up_left=0;
	}
	

	*/
	/* UP-RIGHT management
	
		if(((LPC_GPIO1->FIOPIN & (1<<29)) == 0) & (LPC_GPIO1->FIOPIN & (1<<28)) == 0){	
		// Joytick SEL pressed 
		up_right++;
		switch(up_right){
			case 1:
				
	//			INSERISCI QUI LA TUA FUNZIONE
				
				break;
			case 60:	//3sec = 3000ms/50ms = 60 (Valore modificabile)
				
			//	INSERISCI QUI LA TUA FUNZIONE
				
				break;
			default:
				break;
		}
	}
	else{
			up_right=0;
	}
	
	*/
	
	/* DOWN-LEFT management
	
		if(((LPC_GPIO1->FIOPIN & (1<<26)) == 0) & (LPC_GPIO1->FIOPIN & (1<<27)) == 0){	
		// Joytick SEL pressed 
		down_left++;
		switch(down_left){
			case 1:
				
			//	INSERISCI QUI LA TUA FUNZIONE
				
				break;
			case 60:	//3sec = 3000ms/50ms = 60 (Valore modificabile)
				
		//		INSERISCI QUI LA TUA FUNZIONE
				
				break;
			default:
				break;
		}
	}
	else{
		down_left=0;
	}
	
	*/
	/* DOWN-RIGHT management

		if(((LPC_GPIO1->FIOPIN & (1<<26)) == 0) & (LPC_GPIO1->FIOPIN & (1<<28)) == 0){	
		// Joytick SEL pressed 
		down_right++;
		switch(down_right){
			case 1:
				
			//	INSERISCI QUI LA TUA FUNZIONE
				
				break;
			case 60:	//3sec = 3000ms/50ms = 60 (Valore modificabile)
				
				//INSERISCI QUI LA TUA FUNZIONE
				
				break;
			default:
				break;
		}
	}
	else{
		down_right=0;
	}
	*/
	
	
	
	reset_RIT();
  LPC_RIT->RICTRL |= 0x1;	/* clear interrupt flag */
	
  return;
}

/******************************************************************************
**                            End Of File
******************************************************************************/

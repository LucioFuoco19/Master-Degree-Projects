/*********************************************************************************************************
**--------------File Info---------------------------------------------------------------------------------
** File name:           IRQ_timer.c
** Last modified Date:  2014-09-25
** Last Version:        V1.00
** Descriptions:        functions to manage T0 and T1 interrupts
** Correlated files:    timer.h
**--------------------------------------------------------------------------------------------------------
*********************************************************************************************************/
#include <string.h>
#include "LPC17xx.h"
#include "timer.h"
#include "../GLCD/GLCD.h" 
#include "../TouchPanel/TouchPanel.h"
#include <stdio.h> /*for sprintf*/
#include "JOYSTICK/joystick.h"
#include "Button/button.h"
#include "RIT/RIT.h"
#include "Pacman/pacman.h"
#include "Ghost/Ghost.h"
uint16_t SinTable[45] =                                       /* ÕýÏÒ±í                       */
{
    410, 467, 523, 576, 627, 673, 714, 749, 778,
    799, 813, 819, 817, 807, 789, 764, 732, 694, 
    650, 602, 550, 495, 438, 381, 324, 270, 217,
    169, 125, 87 , 55 , 30 , 12 , 2  , 0  , 6  ,   
    20 , 41 , 70 , 105, 146, 193, 243, 297, 353
};

extern pacman p;
extern int volte;
extern int direzione;
extern ghost g;
extern int uscito;
extern int morto;
/******************************************************************************
** Function name:		Timer0_IRQHandler
**
** Descriptions:		Timer/Counter 0 interrupt handler
**
** parameters:			None
** Returned value:		None
**
******************************************************************************/

void TIMER0_IRQHandler (void)
{
	switch(direzione){
		case 1:
			updatepackman(&p,p.x-1,p.y);// su
			checkEat();
		break;
		case 2:
			updatepackman(&p,p.x+1,p.y); // giu
			checkEat();
		break;
		case 3:
			updatepackman(&p,p.x,p.y+1); // dx
			checkEat();
		break;
		case 4:
			 updatepackman(&p,p.x,p.y-1); //sx la sto fixando
			 checkEat();
		break;
		default:
			break;
	}
	  LPC_TIM0->IR = 1;			/* clear interrupt flag */
  return;
}

/******************************************************************************
** Function name:		Timer1_IRQHandler
**
** Descriptions:		Timer/Counter 1 interrupt handler
**
** parameters:			None
** Returned value:		None
**
******************************************************************************/
void TIMER1_IRQHandler (void)
{
	if(g.mode==1){
		//caso in cui il fantasma insegue pacman
		if(uscito==0){
					moveGhostChase(&g,8,12);
					if((g.x==8)&&(g.y==12)){
							uscito=1;
							lockBase();
					}
		}else{
					moveGhostChase(&g,p.x,p.y);
					checkEat();
		}
	}else if(g.mode==2){
		//caso in cui il fantasma deve scappare da pacman 
		if(morto!=1)moveGhostFrightened(&g,p.x,p.y);
		checkEat();
	}
  LPC_TIM1->IR = 1;			/* clear interrupt flag */
  return;
}
/******************************************************************************
** Function name:		Timer2_IRQHandler
**
** Descriptions:		Timer/Counter 0 interrupt handler
**
** parameters:			None
** Returned value:		None
**
******************************************************************************/

void TIMER2_IRQHandler (void)
{
		static int sineticks=0;
	/* DAC management */	
	static int currentValue; 
	currentValue = SinTable[sineticks];
	currentValue -= 410;
	currentValue /= 1;
	currentValue += 410;
	LPC_DAC->DACR = currentValue <<6;
	sineticks++;
	if(sineticks==45) sineticks=0;
	  LPC_TIM2->IR = 1;			/* clear interrupt flag */
  return;
}
/******************************************************************************
** Function name:		Timer3_IRQHandler
**
** Descriptions:		Timer/Counter 0 interrupt handler
**
** parameters:			None
** Returned value:		None
**
******************************************************************************/

void TIMER3_IRQHandler (void)
{
		disable_timer(2);
	  LPC_TIM3->IR = 1;			/* clear interrupt flag */
  return;
}
/******************************************************************************
**                            End Of File
******************************************************************************/

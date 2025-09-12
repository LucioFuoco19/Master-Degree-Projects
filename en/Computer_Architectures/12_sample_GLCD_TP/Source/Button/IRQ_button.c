#include "button.h"
#include "RIT/RIT.h"
#include "JOYSTICK/joystick.h"
#include "timer.h"
volatile int down;
extern int INT0;
void EINT0_IRQHandler (void)	  	/* INT0														 */
	{	
  NVIC_DisableIRQ(EINT0_IRQn);
  LPC_PINCON->PINSEL4    &= ~(1 << 20);//ATTIVA PULSANTE
	INT0=1; // --> Aggiorno a 1 il valore della variabile globale
	LPC_SC->EXTINT &= (1 << 0);     /* clear pending interrupt         */
}


void EINT1_IRQHandler (void)	  	/* KEY1														 */
{
	NVIC_DisableIRQ(EINT1_IRQn);		/* disable Button interrupts			 */
	LPC_PINCON->PINSEL4    &= ~(1 << 22);     /* GPIO pin selection */
	down=1;
	LPC_SC->EXTINT &= (1 << 1);     /* clear pending interrupt         */
}

void EINT2_IRQHandler (void)	  	/* KEY2														 */
{
	
  LPC_SC->EXTINT &= (1 << 2);     /* clear pending interrupt         */    
}



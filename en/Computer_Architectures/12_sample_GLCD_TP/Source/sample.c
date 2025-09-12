/****************************************Copyright (c)****************************************************
**                                      
**                                 http://www.powermcu.com
**
**--------------File Info---------------------------------------------------------------------------------
** File name:               main.c
** Descriptions:            The GLCD application function
**
**--------------------------------------------------------------------------------------------------------
** Created by:              AVRman
** Created date:            2010-11-7
** Version:                 v1.0
** Descriptions:            The original version
**
**--------------------------------------------------------------------------------------------------------
** Modified by:             Paolo Bernardi
** Modified date:           03/01/2020
** Version:                 v2.0
** Descriptions:            basic program for LCD and Touch Panel teaching
**
*********************************************************************************************************/

/* Includes ------------------------------------------------------------------*/
#include "LPC17xx.h"
#include "GLCD/GLCD.h" 
#include "TouchPanel/TouchPanel.h"
#include "timer/timer.h"
#include "JOYSTICK/joystick.h"
#include "Pacman/pacman.h"
#include "RIT/RIT.h"
#include "Button/button.h"
#include "ADC/adc.h"
#include "CAN/CAN.h"
#ifdef SIMULATOR
extern uint8_t ScaleFlag; // <- ScaleFlag needs to visible in order for the emulator to find the symbol (can be placed also inside system_LPC17xx.h but since it is RO, it needs more work)
#endif

int main(void)
{
		SystemInit();  					/* System Initialization (i.e., PLL)  */
		LCD_Initialization();
		LCD_Clear(Black);
		BUTTON_init();
	  CAN_Init();
		init_RIT(0x004c4b40); //RIT con frequneza di 50ms a 100 MHz ms | =5*10^6
		init_timer(0,0x0039c780); //timer che gestisce pacman 150 ms *25 MHz
		init_timer(1,0x00f7f490); //625ms*25 MHz (ghost)
		pause_funct();
		enable_RIT();
		ADC_init();
		LPC_SC->PCON |= 0x1;									/* power-down	mode										*/
		LPC_SC->PCON &= ~(0x2);			
	
		joystick_init();
			LPC_PINCON->PINSEL1 |= (1<<21);
			LPC_PINCON->PINSEL1 &= ~(1<<20);
			LPC_GPIO0->FIODIR |= (1<<26);
	
		while (1)	
		{
		
			__ASM("wfi");
		}
}

/*********************************************************************************************************
      END FILE
*********************************************************************************************************/

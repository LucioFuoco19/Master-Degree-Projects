#include "pacman.h"
#include "GLCD.h"
#include  <string.h>
void DrawSquare8x8(uint16_t Xpos, uint16_t Ypos, uint16_t color) {
  uint16_t y,x;
  for (y = 0; y < DimensioneY; y++) { // Altezza del quadrato
        for (x = 0; x < DimensioneX; x++) { // Larghezza del quadrato
            LCD_SetPoint(Xpos + x, Ypos + y, color); // Disegna ogni pixel
        }
    }
}
void DrawCircle4x4(uint16_t Xpos, uint16_t Ypos, uint16_t color) {
	int y,x,centerX=0,centerY=0,radiusX=0,radiusY=0;
     centerX=Xpos+DimensioneX/2; // Centro del cerchio sull'asse X (dimensioni 10, quindi il centro è a Xpos+5)
     centerY=Ypos+DimensioneY/2; // Centro del cerchio sull'asse Y (dimensioni 11, quindi il centro è a Ypos+5)
     radiusX=4;
	   radiusY=4;

    for (y = Ypos; y < Ypos + DimensioneY; y++) { // Limite Ypos + 10 per altezza 10
        for ( x = Xpos; x< Xpos + DimensioneX; x++) { // Limite Xpos + 11 per larghezza 11
            // Calcola la distanza dal centro per ogni punto
            int dx = x - centerX;
            int dy = y - centerY;
						int distanceSquared = dx * dx + dy * dy;
            // Verifica se il punto (x, y) è dentro l'ellisse (approssimazione del cerchio)
            // Formula dell'ellisse: (dx^2 / radiusX^2) + (dy^2 / radiusY^2) <= 1
					 if (distanceSquared <= radiusX*radiusY) {
                LCD_SetPoint(x, y, color);
            }
        }
    }
}
void DrawCircle8x8(uint16_t Xpos, uint16_t Ypos, uint16_t color) {
    int centerX = Xpos + DimensioneX/2; // Centro del cerchio sull'asse X
    int centerY = Ypos + DimensioneY/2; // Centro del cerchio sull'asse Y
    int radius = 2, y, x;         // Raggio del cerchio

    for (y = Ypos; y < Ypos + DimensioneY; y++) {
        for (x = Xpos; x < Xpos + DimensioneX; x++) {
            // Calcola la distanza dal centro
            int dx = x - centerX;
            int dy = y - centerY;
            int distanceSquared = dx * dx + dy * dy;

            // Disegna il pixel se la distanza dal centro è minore o uguale al raggio
            if (distanceSquared <= radius * radius) {
                LCD_SetPoint(x, y, color);
            }
        }
    }
}
void DrawPacman(uint16_t Xpos, uint16_t Ypos, uint16_t color) {
    int centerX = Xpos + DimensioneX/2; // Centro sull'asse X (moltiplicato per 10)
    int centerY = Ypos + DimensioneY/2; // Centro sull'asse Y (moltiplicato per 11)
    int radius = DimensioneX/2;         // Raggio del cerchio di Pacman
    int y, x;

    // Disegna il cerchio di Pacman
    for (y = Ypos; y < Ypos + DimensioneY; y++) { 
        for (x = Xpos; x < Xpos + DimensioneX; x++) { 
            int dx = x - centerX;
            int dy = y - centerY;
            int distanceSquared = dx * dx + dy * dy;

            // Disegna il cerchio, omettendo un "morso" per formare Pacman
            if (distanceSquared <= radius * radius) {
                // Crea la "morsa" di Pacman
                if (!(dy > 0 && dx > -dy && dx < dy)) { // Esclude il "morso"
                    LCD_SetPoint(x, y, color); // Disegna il pixel
                }
            }
        }
    }
}

void ClearPacman(uint16_t Xpos, uint16_t Ypos, uint16_t bkColor) {
    int x,y;
    // Cancella Pacman riempiendo la stessa area con il colore di sfondo
    for (y = Ypos; y < Ypos + DimensioneY; y++) {
        for (x = Xpos; x < Xpos + DimensioneX; x++) {
                LCD_SetPoint(x, y, bkColor); // Cancella il pixel
            
        }
    }
}



void drawLabirinth(int Matrice[RIGHE][COLONNE]){

	  int startx=0,starty=20,i,j; /*inserisco 20 per una mera questione di gusto, andrebbbe 
										bene anche da 16 ciò + stato fatto per lasciare spazio alla gui */
 for (i=0; i<RIGHE;i++){
      for(j=0; j<COLONNE;j++){
        if(Matrice[i][j]==1){ //caso in cui vado a creare un muro blu
         DrawSquare8x8(startx,starty,Blue); //coloro un blocco di muro
      }
        else if (Matrice[i][j]==0){ //caso in cui vado a creare una 'monetina' 
        DrawCircle8x8(startx,starty,Yellow); //coloro un blocco di monete 
      } else if(Matrice [i][j]==3){ //caso delle superpills
			 DrawCircle4x4(startx,starty,Magenta);
			} else if(Matrice[i][j]==4){ // caso del cancello
					DrawGate(startx,starty,Green);
			}
      
      startx+=DimensioneX;
    }
      startx=0;
      starty+=DimensioneY;
  }

}

void countdown() {
    int x = 60, y = 120, size = 120,textX,textY;  // Posizione del quadrato e dimensione
    char countdownText[50];  // Per memorizzare i numeri del conto alla rovescia
		char scritta[50];
    // Conto alla rovescia da 3 a 1
    for (int i = 3; i > 0; i--) {
        // Pulisce il quadrato (opzionale, se necessario per aggiornare lo schermo)
        
        
        // Ridisegna il quadrato
        drawSquare(x, y, size);
        
        // Mostra il numero all'interno del quadrato
        sprintf(countdownText, "%d..", i);  // Converte l'intero in stringa
        sprintf(scritta,"Via!!!");
				 textX = x + size / 2 - (strlen(countdownText) * 8) / 2; // 8 è la larghezza di un carattere standard
         textY = y + size / 2 - 8; // 8 è l'altezza di un carattere standard
        GUI_Text(textX, textY, (uint8_t *)countdownText, Red, White);  // Testo rosso su sfondo bianco
        
        
        // Aggiungi un delay di 1 secondo
       // delay(1000);
    }

    // Pulisce il quadrato e scrive "Via!!!"
    LCD_Clear(White);
    
     textX = x + size / 2 - (strlen(scritta) * 8) / 2;
     textY = y + size / 2 - 8;
    GUI_Text(textX, textY, (uint8_t *)scritta, Red, White);

    // Aggiungi un piccolo delay per visualizzare "Via!!!"
    //delay(1000);
}

void drawSquare(int x, int y, int size) {
	LCD_Clear(Blue);
	fillRectangle(x, y, x + size, y + size, White);
	GLCD_DrawRectangle(x, y, x + size, y + size);
	
}
void GLCD_DrawRectangle(int x1, int y1, int x2, int y2){
		LCD_DrawLine(x1, y1, x2, y1,Black);
    // Disegna il bordo inferiore
    LCD_DrawLine(x1, y2, x2, y2,Black);
    // Disegna il bordo sinistro
    LCD_DrawLine(x1, y1, x1, y2,Black);
    // Disegna il bordo destro
    LCD_DrawLine(x2, y1, x2, y2,Black);
}
void fillRectangle(int x1, int y1, int x2, int y2, uint16_t color) {
    for (int y = y1; y <= y2; y++) {
        for (int x = x1; x <= x2; x++) {
            LCD_SetPoint(x, y, color); // Disegna ogni punto del rettangolo
        }
    }
}

void Gameover(void){
 int x = 60, y = 120, size = 120,textX,textY;  // Posizione del quadrato e dimensione
    char countdownText[50];  // Per memorizzare i numeri del conto alla rovescia
        // Ridisegna il quadrato
        drawSquare(x, y, size);
        sprintf(countdownText, "GAME OVER !");  // Converte l'intero in stringa
				 textX = x + size / 2 - (strlen(countdownText) * 8) / 2; // 8 è la larghezza di un carattere standard
         textY = y + size / 2 - 8; // 8 è l'altezza di un carattere standard
        GUI_Text(textX, textY, (uint8_t *)countdownText, Red, White);  // Testo rosso su sfondo bianco
       delay(2000); //ritardo di due secondi
    
}

void pause_funct(void){
	
char message1[50];
char message2[80];
int x = 60, y = 120, size = 120,textX,textY;
GLCD_DrawRectangle(x, y, x + size, y + size);
fillRectangle(x, y, x + size, y + size, White);
sprintf(message1,"|PAUSE MODE|");
	sprintf(message2," |PREMI 'EINT0' PER GIOCARE!|");
				textX = x + size / 2 - (strlen(message1) * 8) / 2; // 8 è la larghezza di un carattere standard
        textY = y + size / 2 - 8; // 8 è l'altezza di un carattere standard
        GUI_Text(textX, textY, (uint8_t *)message1, Red, White);  // Testo rosso su sfondo bianco
				        GUI_Text(0,304, (uint8_t *)message2, Red, White);  // Testo rosso su sfondo bianco

}

void Win(void){
char message[35];
int x = 60, y = 120, size = 120,textX,textY;
LCD_Clear(Black);
sprintf(message," YOU WIN! ");
GLCD_DrawRectangle(x, y, x + size, y + size);
fillRectangle(x, y, x + size, y + size,Blue);
textX = x + size / 2 - (strlen(message) * 8) / 2; // 8 è la larghezza di un carattere standard
textY = y + size / 2 - 8; // 8 è l'altezza di un carattere standard
GUI_Text(textX, textY, (uint8_t *)message, Yellow,Blue);  // Testo giallo su sfondo blu
}

void DrawGate(uint16_t Xpos, uint16_t Ypos, uint16_t color) {
    // Disegna una linea orizzontale sulla parte alta del blocco
    for (int x = Xpos; x < Xpos + DimensioneX; x++) { // Linea orizzontale che va da Xpos a Xpos + 10
        LCD_SetPoint(x, Ypos, color);  // Disegna il punto sulla parte superiore
    }

}

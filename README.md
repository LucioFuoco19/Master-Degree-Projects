# Master-Degree-Projects

- IT:Seleziona la lingua che preferisci per consultare i miei progetti.
- EN:Select the language you prefer to browse my projects.
---
<details>
<summary>🇮🇹 Italiano</summary>

In questo repository raccolgo i progetti sviluppati, singolarmente e in gruppo, durante il mio percorso di studi magistrale in **Artificial Intelligence & Data Analytics** presso il Politecnico di Torino. Verranno aggiunti progressivamente man mano che il percorso avanza.  

### Progetti
<details>
<summary>Architettura dei Sistemi di Elaborazione</summary>

## Descrizione:
Questa versione semplificata di **Pac-Man** riproduce il classico gioco arcade con le seguenti caratteristiche principali:

- **Labirinto** riempito con 240 pillole standard e 6 pillole speciali (Power Pills) generate in posizioni e tempi casuali.  
- **Controlli**: Pac-Man si muove nella direzione scelta finché non incontra un muro o il giocatore non cambia direzione.  
- **Teletrasporto laterale**: attraversando i portali del labirinto, Pac-Man ricompare dal lato opposto mantenendo la stessa direzione.  
- **Punteggio**: +10 punti per ogni pillola standard, +50 per le Power Pills. Ogni 1000 punti si guadagna una vita extra.  
- **Pause mode**: il gioco parte in pausa; un pulsante dedicato consente di fermare/riprendere la partita.  
- **Timer**: il conto alla rovescia parte da 60 secondi.  
  - Se tutte le pillole vengono mangiate prima della scadenza → **Victory Screen**  
  - Se il tempo finisce prima → **Game Over Screen**

- **Effetti sonori**: tramite uno speaker vengono riprodotti suoni e musiche, tra cui sigla iniziale, pausa, fine gioco e una melodia di sottofondo durante la partita.  
- **Fantasma con IA**: è stato implementato un fantasma che col progredire dei secondi aumenta progressivamente la propria velocità. I suoi movimenti sono guidati da un algoritmo basato sulla **distanza euclidea**, che lo indirizza verso Pac-Man.  
- **Visualizzazione punteggio tramite CAN**: è stata aggiunta una modalità che permette di visualizzare il punteggio del giocatore attraverso l’interfaccia di comunicazione **CAN bus**.  
---
- [PAC-MAN](it/Architettura_Dei_Sistemi_Di_Elaborazione)
---
</details>

<details>
<summary>Ingegneria del Software</summary>

## Descrizione
**GeoControl** è un **sistema di monitoraggio** progettato per gestire reti di sensori in grado di misurare variabili geologiche, meteorologiche ed ambientali (es. temperatura, umidità, pressione, concentrazione di gas, posizione).  
Il progetto è stato sviluppato durante il corso di *Ingegneria del Software* (a.a. 2024–2025) e si concentra su una **versione simulata** del sistema (nessun hardware reale richiesto).

### Funzionalità
- **Gestione Utenti** (Admin): creazione, eliminazione e gestione degli utenti.  
- **Configurazione Rete** (Operatore): creazione e configurazione di reti, gateway e sensori.  
- **Gestione Misurazioni** (Viewer):  
  - Recupero dei dati dai sensori.  
  - Calcolo di statistiche (media, deviazione standard, ecc.).  
  - Rilevamento di valori anomali (outlier).  
  - Inserimento di nuove misurazioni.  

### Ruoli Utente
- **Amministratore** → gestisce gli utenti.  
- **Operatore** → configura reti, gateway e sensori.  
- **Visualizzatore** → consulta e analizza le misurazioni.  

### Dettagli Tecnici
- **Architettura**: sistema software simulato con API REST.  
- **Requisiti Non Funzionali**:  
  - Sicurezza: accesso consentito solo a utenti autorizzati.  
  - Affidabilità: massimo 6 misurazioni perse per sensore/anno.  
  - Efficienza: tempo di risposta < 0,5 secondi.  
  - Localizzazione: timestamp in UTC.  


---
- [GeoControl](it/Ingegneria_del_Software)
---
</details>
<details>
<summary>Web Applications I</summary>

## Descrizione:
Questo progetto è una **web application** per la gestione degli assignments di gruppo in una classe di studenti, supervisionata da più insegnanti.  
Offre funzionalità dedicate sia per i **docenti** che per gli **studenti**.

- **Docenti**:
  - Creare nuovi assignments scrivendo una domanda e selezionando gruppi di 2–6 studenti.  
  - Il sistema impedisce la creazione di gruppi in cui una coppia di studenti abbia già lavorato insieme in almeno 2 assignments precedenti (per lo stesso docente).  
  - Visualizzare le risposte inviate dagli studenti e assegnare un voto (0–30).  
  - Una volta assegnato il voto, l’assignment diventa **chiuso** e non può più essere modificato.  
  - Monitorare lo stato della classe, visualizzando per ciascuno studente:  
    - Numero di assignments aperti  
    - Numero di assignments chiusi  
    - Media pesata dei voti (peso = inverso della dimensione del gruppo)  
  - Opzioni di ordinamento: ordine alfabetico, numero di assignments o media dei voti.  

- **Studenti**:
  - Visualizzare tutti gli assignments aperti a cui partecipano.  
  - Inviare o aggiornare la risposta del gruppo fino alla valutazione da parte del docente.  
  - Visualizzare i voti ricevuti negli assignments chiusi e la propria media complessiva pesata.  

- **Dettagli tecnici**:
  - **Backend**: Node.js con Express  
  - **Frontend**: React (hooks, state, context, effects)  
  - **Database**: SQLite pre-popolato con almeno 20 studenti e 2 docenti (con almeno 1 assignment aperto e 1 chiuso).  
  - **Autenticazione**: accesso separato per docenti e studenti.  

---
- [Group Assignments](it/Web_Applications_I)
---
</details>



</details>

---
<details>
<summary>🇬🇧 English</summary>

In this repository I collect the projects developed, both individually and in groups, during my **Master's degree in Artificial Intelligence & Data Analytics** at Politecnico di Torino. They will be progressively added as my studies advance.  

### Projects
<details>
<summary>Computer Architecture</summary>

## Description:
This simplified version of **Pac-Man** reproduces the classic arcade game with the following main features:

- **Maze** filled with 240 standard pills and 6 special Power Pills generated at random positions and times.  
- **Controls**: Pac-Man keeps moving in the chosen direction until he hits a wall or the player changes direction.  
- **Side teleport**: when crossing the portals of the maze, Pac-Man reappears on the opposite side while maintaining the same direction.  
- **Scoring**: +10 points for each standard pill, +50 for Power Pills. Every 1000 points the player earns an extra life.  
- **Pause mode**: the game starts in pause mode; a dedicated button allows pausing/resuming the game.  
- **Timer**: the countdown starts from 60 seconds.  
  - If all pills are eaten before the timer expires → **Victory Screen**  
  - If time runs out first → **Game Over Screen**  

- **Sound effects**: through a speaker, various sounds and music are played, including intro theme, pause, game over, and background melody during gameplay.  
- **AI Ghost**: a ghost was implemented which progressively increases its speed as time passes. Its movement is guided by an algorithm based on the **Euclidean distance**, which directs it toward Pac-Man.  
- **Score visualization via CAN**: a feature was added to display the player’s score using the **CAN bus** communication interface.  
---
- [PAC-MAN](en/Computer_Architectures)
---
</details>

<details>
<summary>Software Engineering</summary>
## Description
**GeoControl** is a **monitoring system** designed to manage networks of sensors that measure geological, meteorological, and environmental variables (e.g., temperature, humidity, pressure, gas concentration, position).  
The project was developed during the *Software Engineering* course (AY 2024–2025) and focuses on a **simulated version** of the system (no real hardware required).

### Features
- **User Management** (Admin): create, delete, and manage users.  
- **Network Configuration** (Operator): create and configure networks, gateways, and sensors.  
- **Measurements Handling** (Viewer):  
  - Retrieve sensor data.  
  - Compute statistics (mean, std. deviation, etc.).  
  - Detect outliers.  
  - Store new measurements.  

### User Roles
- **Administrator** → manages users.  
- **Operator** → configures networks, gateways, and sensors.  
- **Viewer** → visualizes and analyzes measurements.  

### Technical Details
- **Architecture**: simulated software system with REST APIs.  
- **Non-Functional Requirements**:  
  - Security: access restricted to authorized users.  
  - Reliability: max 6 lost measurements per sensor/year.  
  - Efficiency: response time < 0.5 sec.  
  - Localization: timestamps in UTC.  
---
- [GeoControl](en/Software_Engineering)
---
</details>
<details>
<summary>Web Applications I</summary>

## Description:
This project is a **web application** for managing group assignments in a class of students, supervised by multiple teachers.  
It provides dedicated functionalities for both **teachers** and **students**.

- **Teachers**:
  - Create new assignments by writing a question and selecting groups of 2–6 students.  
  - The system prevents the creation of groups where a pair of students has already worked together in at least 2 previous assignments (for the same teacher).  
  - View the answers submitted by students and assign a grade (0–30).  
  - Once graded, the assignment becomes **closed** and cannot be modified.  
  - Monitor the class status, showing for each student:  
    - Number of open assignments  
    - Number of closed assignments  
    - Weighted average grade (weights = inverse of group size)  
  - Sorting options: alphabetical order, number of assignments, or average grade.  

- **Students**:
  - View all open assignments they are involved in.  
  - Submit or update the group’s answer until the teacher evaluates it.  
  - View grades in closed assignments and their overall weighted average score.  

- **Technical details**:
  - **Backend**: Node.js with Express  
  - **Frontend**: React (hooks, state, context, effects)  
  - **Database**: SQLite preloaded with at least 20 students and 2 teachers (with at least 1 open and 1 closed assignment).  
  - **Authentication**: separate login and access for teachers and students.
---
- [Group Assignments](en/Web_Applications_I)
---
</details>
</details>

# Master-Degree-Projects

- IT: Seleziona la lingua che preferisci per consultare i miei progetti.
- EN: Select the language you prefer to browse my projects.
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
### 🛠️ Tecnologie e strumenti

- **Linguaggio di programmazione**:  
  - [C](https://en.wikipedia.org/wiki/C_(programming_language)) (sviluppo del gioco, gestione periferiche e logica di gioco)

- **Ambiente di sviluppo**:  
  - [Keil µVision](https://www.keil.com/) (compilazione, debug ed emulazione)  
  - Compilation target: **SW_Debug** (per emulare il comportamento della LandTiger Board)

- **Hardware / Emulator**:  
  - [LandTiger Board LPC1768](http://www.embedinfo.com/landtiger/) (microcontrollore ARM Cortex-M3, display integrato, joystick, pulsanti, periferiche)  
  - Emulatore fornito da Keil (per chi non dispone della board fisica)

- **Caratteristiche aggiuntive**:  
  - **Speaker**: configurazione e utilizzo per effetti sonori di gioco  
  - **CAN Bus**: gestione e comunicazione via Controller Area Network  
  - **Fantasma IA**: implementazione di un fantasma con algoritmo basato sulla **distanza euclidea** per inseguire Pac-Man  

- **Debug & Testing**:  
  - Keil debugger con visualizzazione periferiche (display, joystick, interruzioni, audio)  

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
### 🛠️ Tecnologie e strumenti

- **Linguaggio di programmazione**:  
  - [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) (implementazione delle API, logica applicativa, gestione dei moduli)

- **Ambiente di sviluppo**:  
  - [Visual Studio Code](https://code.visualstudio.com/) (sviluppo e debugging)  

- **Backend & Architettura**:  
  - [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/) (API REST, routing modulare)  
  - [Docker](https://www.docker.com/) (containerizzazione e gestione dell’ambiente di esecuzione)  

- **Version Control & Collaboration**:  
  - [GitLab](https://about.gitlab.com/) (repository, branching, merge, gestione del progetto)  

- **Testing**:  
  - **White-box testing** (copertura del codice, test su funzioni e moduli)  
  - **Black-box testing** (test funzionali e di sistema)  
  - [Postman](https://www.postman.com/) (test isolati di alcune route API)  
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
### 🛠️ Tecnologie e Strumenti

- **Frontend**:  
  - [React 19](https://react.dev/) (SPA, Strict Mode, functional components, hooks, state, context, effects)  
  - [React Router](https://reactrouter.com/) (gestione delle rotte lato client)  

- **Backend**:  
  - [Node.js 22.x (LTS)](https://nodejs.org/)  
  - [Express.js](https://expressjs.com/) (HTTP API, routing, middleware)  
  - [Passport.js](http://www.passportjs.org/) (autenticazione con session cookies)  
  - [bcrypt](https://www.npmjs.com/package/bcrypt) (hashing e salting delle credenziali)  
  - [CORS](https://www.npmjs.com/package/cors) (configurazione “two servers” pattern)  
  - [nodemon](https://nodemon.io/) (per avvio e hot-reload del server)  

- **Database**:  
  - [SQLite](https://www.sqlite.org/) (archiviazione dati su file)  

- **Strumenti di sviluppo**:  
  - [npm](https://www.npmjs.com/) (gestione pacchetti)  
  - [GitHub](https://github.com/) (version control e repository)  
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
### 🛠️ Technologies & Tools

- **Programming Language**:  
  - [C](https://en.wikipedia.org/wiki/C_(programming_language)) (game development, peripheral management, and game logic)

- **Development Environment**:  
  - [Keil µVision](https://www.keil.com/) (compilation, debugging, and emulation)  
  - Compilation target: **SW_Debug** (to emulate the behavior of the LandTiger Board)

- **Hardware / Emulator**:  
  - [LandTiger Board LPC1768](http://www.embedinfo.com/landtiger/) (ARM Cortex-M3 microcontroller, integrated display, joystick, buttons, peripherals)  
  - Keil emulator (for students without the physical board)

- **Additional Features**:  
  - **Speaker**: configuration and usage for in-game sound effects  
  - **CAN Bus**: communication and management via Controller Area Network  
  - **Ghost AI**: implementation of a ghost using the **Euclidean distance** algorithm to chase Pac-Man  

- **Debug & Testing**:  
  - Keil debugger with peripheral visualization (display, joystick, interrupts, audio)  

---
- [PAC-MAN](en/Computer_Architectures)
---
</details>

<details>
<summary>Software Engineering</summary>

**Description**  
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
### 🛠️ Technologies & Tools

- **Programming Language**:  
  - [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) (API implementation, application logic, module management)

- **Development Environment**:  
  - [Visual Studio Code](https://code.visualstudio.com/) (development and debugging)  

- **Backend & Architecture**:  
  - [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/) (REST APIs, modular routing)  
  - [Docker](https://www.docker.com/) (containerization and execution environment management)  

- **Version Control & Collaboration**:  
  - [GitLab](https://about.gitlab.com/) (repository, branching, merging, project management)  

- **Testing**:  
  - **White-box testing** (code coverage, unit and module testing)  
  - **Black-box testing** (functional and system testing)  
  - [Postman](https://www.postman.com/) (isolated testing of specific API routes)  
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
### 🛠️ Technologies & Tools

- **Frontend**:  
  - [React 19](https://react.dev/) (SPA, Strict Mode, functional components, hooks, state, context, effects)  
  - [React Router](https://reactrouter.com/) (client-side route management)  

- **Backend**:  
  - [Node.js 22.x (LTS)](https://nodejs.org/)  
  - [Express.js](https://expressjs.com/) (HTTP API, routing, middleware)  
  - [Passport.js](http://www.passportjs.org/) (authentication with session cookies)  
  - [bcrypt](https://www.npmjs.com/package/bcrypt) (credential hashing and salting)  
  - [CORS](https://www.npmjs.com/package/cors) (configuration model “two servers”)  
  - [nodemon](https://nodemon.io/) (for startup and server hot-reload)  

- **Database**:  
  - [SQLite](https://www.sqlite.org/) (data storage on file)  

- **Development Tools**:  
  - [npm](https://www.npmjs.com/) (packet management)  
  - [GitHub](https://github.com/) (version control and repository)  

---
- [Group Assignments](en/Web_Applications_I)
---
</details>
</details>
 
---

### 📬 Contacts    

[![Email](https://img.shields.io/badge/Email-fuoco.lucio19%40gmail.com-red?logo=gmail&logoColor=white)](mailto:fuoco.lucio19@gmail.com)  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Lucio%20Fuoco-blue?logo=linkedin)](https://www.linkedin.com/in/lucio-fuoco-2817422a7/)  

---

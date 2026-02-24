# Corrispondenza semantica con modelli di fondazione visiva

Un framework per la **corrispondenza semantica dei punti chiave** tra istanze di oggetti, creato come progetto per il corso Advanced Machine Learning (AML).

Date due immagini della stessa categoria di oggetti, il sistema prevede corrispondenze a livello di pixel tra punti chiave semanticamente equivalenti (ad esempio, l'occhio sinistro di un gatto ↔ l'occhio sinistro di un altro gatto), anche in presenza di variazioni significative di aspetto e posa.

---

## Panoramica

Il gasdotto funziona nelle seguenti fasi:

1. **Estrazione delle caratteristiche** — Una struttura visiva pre-addestrata estrae mappe di caratteristiche dense sia dalle immagini di origine che da quelle di destinazione.
2. **Corrispondenza corrispondente** — La similarità del coseno viene calcolata tra le caratteristiche del punto chiave sorgente e tutte le posizioni delle caratteristiche target; la corrispondenza migliore viene trovata tramite argmax.
3. **Valutazione** — Le corrispondenze previste vengono valutate utilizzando la metrica **PCK** (percentuale di punti chiave corretti) a soglie multiple (α = 0,05, 0,10, 0,15, 0,20).
4. **Fine-Tuning** — Gli ultimi * N* blocchi del trasformatore della dorsale vengono scongelati e addestrati con una perdita di entropia incrociata levigata gaussiana per una migliore localizzazione dei punti chiave.
5. **Window Soft-Argmax** — Una strategia di decodifica della corrispondenza raffinata che sostituisce l'argmax rigido standard con un softmax locale attorno al picco, ottenendo una precisione sub-pixel.
6. **Test di robustezza** — I modelli vengono inoltre valutati su **PF-Pascal**, **PF-Willow** e **AP-10k** per misurare la generalizzazione tra set di dati.

## Backbone supportato

| Spina dorsale | Architettura | Risoluzione | Chiave |
|---|---|---|---|
| **DINOv2** | ViT-S/14, ViT-B/14 | 518×518 | `dinov2_vits14`, `dinov2_vitb14` |
| **DINOv3** | ViT-S/16, ViT-B/16 | 592×592 | `dinov3_vits16`, `dinov3_vitb16` |
| **SAM** | ViT-B | 592 × 592 | `sam_vitb` |

DINOv3 e SAM sono inclusi come **sottomoduli git** in `external/`.

## Set di dati supportati

| Set di dati | Attività | Fonte |
|---|---|---|
| **SPair-71k** | Corrispondenza dei punti chiave| [link](http://cvlab.postech.ac.kr/research/SPair-71k/) |
| **PF-Pascal** | Corrispondenza dei punti chiave | [link](https://www.di.ens.fr/willow/research/proposalflow/) |
| **PF-Willow** | Corrispondenza dei punti chiave | [link](https://www.di.ens.fr/willow/research/proposalflow/) |
| **AP-10k** | Stima della posa degli animali | tramite `prepare_ap10k.ipynb` (adattato da [GeoAware-SC](https://github.com/Junyi42/GeoAware-SC)) |

## Struttura del progetto

```
├── modelli/ # Estrattori di funzionalità
│ ├── dinov2/ # Involucro DINOv2
│ ├── dinov3/ # Wrapper DINOv3
│ ├── SAM/ # Wrapper SAM
│ └── models_factory.py # Costruttore di backbone
├── utilità/
│ ├── matching.py # Somiglianza + argmax / finestra soft-argmax
│ ├── loss.py # Perdita di entropia incrociata levigata gaussiana
│ ├── metrics.py # Calcolo PCK
│ ├── geometry.py # Trasformazioni di coordinate
│ ├── cli.py # Parser di argomenti CLI
│ ├── train_utils.py # Checkpointing e sincronizzazione dell'unità
│ └── validation.py # Ciclo di convalida
├── dataset/ # Caricatori di dataset (SPair, PF-Pascal, PF-Willow, AP-10k)
├── esterno/ # Sottomoduli Git (DINOv3, Segmenta qualsiasi cosa)
├── train.py # Punto di ingresso alla formazione
├── eval.py # Punto di ingresso della valutazione
├── project_config.py # Configurazione globale
└── requirements.txt # Dipendenze Python
```

## Sintonizzazione fine

Il framework supporta la messa a punto parziale degli ultimi *N* blocchi del trasformatore mantenendo congelati gli strati precedenti. L'addestramento utilizza una **perdita di entropia incrociata levigata dalla gaussiana** sulla mappa di correlazione spaziale, che fornisce gradienti più uniformi attorno alla posizione del punto chiave di verità a terra rispetto a una perdita standard del bersaglio duro. L'implementazione della perdita è adattata da [SD4Match](https://github.com/ActiveVisionLab/SD4Match) (Li et al., CVPR 2024).

## Finestra Soft-Argmax

Durante l'inferenza, l'argmax rigido standard seleziona la singola posizione con il punteggio più alto sulla mappa delle funzionalità, che limita le previsioni alla griglia delle funzionalità discrete. **Window Soft-Argmax** migliora questo aspetto identificando prima il picco argmax duro e quindi applicando un softmax su scala di temperatura all'interno di una finestra locale attorno ad esso. Il punto chiave previsto viene quindi calcolato come centroide ponderato (centro di massa) di questa distribuzione, ottenendo corrispondenze **precise sub-pixel** senza alcun costo di addestramento aggiuntivo. La tecnica è adattata da Zhang et al., CVPR 2024 — *Telling Left from Right: Identifying Geometry-Aware Semantic Correspondence*.



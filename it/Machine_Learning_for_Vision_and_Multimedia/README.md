<h1 align="center"><strong>Riconoscimento Emotivo del Parlato (SER) con Attention CNN-LSTM</strong></h1>

Questo progetto implementa un sistema di riconoscimento emotivo vocale utilizzando il dataset RAVDESS. L'architettura del modello combina reti neurali convoluzionali (CNN) per l'estrazione di caratteristiche spaziali, reti LSTM per la memoria temporale e un meccanismo di Attention per focalizzarsi sui segmenti audio più rilevanti.

## Struttura del Progetto
```text
Speach_Emotion_Recognition/
├── data/
│   ├── prepare_data.py       # Script per elaborare audio e augmentation
│   └── dataset.py            # Utilità per caricare dati in TF
├── models/
│   └── model.py              # Architettura Attention CNN-LSTM
├── utils/
│   ├── callbacks.py          # EarlyStopping e salvataggio modello
│   └── visuals.py            # Matrici di confusione e grafici della cronologia
├── dataset/
│   ├── RawData/              # File originali .wav  (es. Actor_01/...)
│   └── (generated)/          # Dataset elaborato in formato .npy
├── checkpoints/              # Risultati e modelli salvati per ogni esperimento
├── train.py                  # Script principale: addestramento + valutazione
└── requirements.txt          # Dipendenze del progetto



***



## Preparazione del Dataset
Il progetto utilizza il dataset RAVDESS. I file audio vengono trasformati in spettrogrammi Mel (128x128X1) e salvati in formato .npy per velocizzare il caricamento.

* 1. Esecuzione dello Script
    Per preparare i dati, apri il terminale e digita:

    Bash
    python data/prepare_data.py

    Segui il menu interattivo per scegliere tra:

        + Actor Split (Augmented): Training su attori 01-20, Test su 21-24.

        + Random Split (Augmented): Split casuale stratificato 80/20.

        + Pure Dataset: Solo file originali (senza augmentation).

* 2. Dettagli sulla Data Augmentation
    Per le modalità "Augmented", applichiamo trasformazioni stocastiche:

        + Time Stretching, Pitch Shifting, Noise Injection, Time Shifting.

        + Bilanciamento: La classe neutral viene aumentata di 12 volte, le altre di 6 volte.



🚀 Addestramento e Valutazione
Abbiamo unificato il flusso in un unico comando. Lo script gestisce l'addestramento e, al termine, carica il miglior modello per generare i report.

Bash
python train.py
Risultati prodotti
Al termine di ogni esperimento, troverai nella cartella checkpoints/res_[esperimento]/:

best_model.keras: I pesi del modello con la miglior validation accuracy.

history_plot.png: Grafico Loss/Accuracy.

confusion_matrix.png: Matrice per analizzare gli errori tra classi.

classification_report.txt: Precision, Recall e F1-Score dettagliati.

2. Su Google Colab
Anche se Colab ha già molte librerie pre-installate, è buona norma assicurarsi che ci siano tutte all'inizio del tuo notebook train_notebook.ipynb:

Python
# Cella iniziale del notebook
!pip install -r requirements.txt
<h1 align="center"><strong>Speech Emotion Recognition (SER) with Attention CNN-LSTM</strong></h1>

This project implements a vocal emotion recognition system using the RAVDESS dataset. The model architecture combines convolutional neural networks (CNNs) for spatial feature extraction, LSTM networks for temporal memory, and an Attention mechanism to focus on the most relevant audio segments.

## Project Structure
```text
Speach_Emotion_Recognition/
├── data/
│   ├── prepare_data.py       # Script to process audio and augmentation
│   └── dataset.py            # Utility to load data in TF
├── models/
│   └── model.py              # Attention CNN-LSTM architecture
├── utils/
│   ├── callbacks.py          # EarlyStopping and model save
│   └── visuals.py            # Confusion matrixs and history graphs
├── dataset/
│   ├── RawData/              # Original file .wav  (es. Actor_01/...)
│   └── (generated)/          # Processed dataset in .npy format
├── checkpoints/              # Risults and saved model for each experiment
├── train.py                  # Main script: training + evaluation
└── requirements.txt          # Project dependencies



***



## Preparation of the Dataset
The project uses the RAVDESS dataset. Audio files are transformed into Mel spectrograms (128x128X1) and saved in .npy format to speed up loading.

* 1. Running the Script
    To prepare the data, open the terminal and type:

    ```bash
    python data/prepare_data.py
    ```

    Follow the interactive menu to choose between:

        + Actor Split (Augmented): Training on actors 01-20, Test on 21-24.

        + Random Split (Augmented): Stratified random split 80/20.

        + Pure Dataset: Original files only (without augmentation).

* 2. Data Augmentation Details
    For "Augmented" modes, we apply stochastic transformations:

        + Time Stretching, Pitch Shifting, Noise Injection, Time Shifting.

        + Balancing: The neutral class is increased 12 times, others 6 times.



## 🚀 Training and Evaluation
We unified the workflow into a single command. The script handles training and, once complete, loads the best model to generate reports.

```bash
python train.py
```

### Generated Results
At the end of each experiment, you will find in the checkpoints/res_[experiment]/ folder:

- **best_model.keras**: The weights of the model with the highest validation accuracy.

- **history_plot.png**: Loss/Accuracy graph.

- **confusion_matrix.png**: Matrix to analyze classification errors between classes.

- **classification_report.txt**: Detailed Precision, Recall, and F1-Score.

### On Google Colab
Although Colab has many pre-installed libraries, it's good practice to ensure you have them all at the beginning of your train_notebook.ipynb notebook:

```python
# Initial cell of the notebook
!pip install -r requirements.txt
```
import os
import tensorflow as tf
from models.model import build_attention_cnn_lstm
from data.dataset import load_and_preprocess_data
from utils.callbacks import get_callbacks
from eval import run_evaluation

def run_training(data_path, results_folder, epochs=60, batch_size=32, augment=True):
    # --- CONFIGURATION ---
    INPUT_SHAPE = (128, 128, 1)
    NUM_CLASSES = 8
    
    # Creazione cartella per i checkpoint specifica per l'esperimento
    checkpoint_dir = os.path.join('checkpoints', results_folder)
    os.makedirs(checkpoint_dir, exist_ok=True)
    checkpoint_path = os.path.join(checkpoint_dir, 'best_model.keras')
    
    # 1. Loading Data - Passiamo il parametro augment alla funzione del dataset
    train_ds, n_train = load_and_preprocess_data(data_path, batch_size, NUM_CLASSES, 
                                                 is_training=True, augment=augment)
    val_ds, n_val = load_and_preprocess_data(data_path, batch_size, NUM_CLASSES, 
                                             is_training=False)

    # 2. Building Model
    model = build_attention_cnn_lstm(INPUT_SHAPE, NUM_CLASSES)
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

    # 3. Retrieving callbacks - Usiamo il path dinamico
    callbacks_list = get_callbacks(checkpoint_path=checkpoint_path)

    # 4. EXECUTE TRAINING
    print(f"\n--- STARTING TRAINING: {results_folder} ---")
    print(f"Dataset path: {data_path}")
    print(f"Augmentation: {augment}")
    
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs,
        callbacks=callbacks_list,
        verbose=1
    )
    print(f"\nStarting evaluation")

    return history, model

if __name__ == "__main__":
    print("="*40)
    print("      SELECT ML EXPERIMENT (VS Code)    ")
    print("="*40)
    print("1) Pure Dataset (No Augmentation, Random Split)")
    print("2) Actor Split (Augmented)")
    print("3) Random Split (Augmented)")
    
    scelta = input("\nWhat experiment do you want to run? (1/2/3): ")

    # Allineamento con i nomi delle cartelle generati da prepare_data.py
    if scelta == '1':
        path = './dataset/pureDataset_RandomSplit/'
        folder = 'res_PureDataset'
        run_training(data_path=path, results_folder=folder, augment=False)
        
    elif scelta == '2':
        path = './dataset/augmentedDataset_9K_ActorSplit/'
        folder = 'res_ActorSplit'
        run_training(data_path=path, results_folder=folder, augment=True)
        
    elif scelta == '3':
        path = './dataset/augmentedDataset_9K_RandomSplit/'
        folder = 'res_RandomSplit'
        run_training(data_path=path, results_folder=folder, augment=True)
        
    else:
        print("Invalid choice. Exiting.")
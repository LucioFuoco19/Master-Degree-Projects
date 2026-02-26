from tensorflow.keras.callbacks import ModelCheckpoint, ReduceLROnPlateau, EarlyStopping
import os

def get_callbacks(checkpoint_path='checkpoints/best_model_random_split.keras'):
    # Crea la cartella dei checkpoint se non esiste
    os.makedirs(os.path.dirname(checkpoint_path), exist_ok=True)

    # A. Checkpoint
    checkpoint = ModelCheckpoint(
        checkpoint_path,
        monitor='val_accuracy',
        save_best_only=True,
        mode='max',
        verbose=1
    )

    # B. Scheduler
    reduce_lr = ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=5,
        min_lr=0.00001,
        verbose=1
    )

    # C. Stopper
    early_stopping = EarlyStopping(
        monitor='val_loss',
        patience=12,
        restore_best_weights=True,
        verbose=1
    )

    return [checkpoint, reduce_lr, early_stopping]
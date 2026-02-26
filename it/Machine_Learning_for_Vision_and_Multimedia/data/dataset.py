import tensorflow as tf
import numpy as np
import os

# --- 1. MAPPATURA DELLE ETICHETTE ---
LABEL_MAP = {
    'neutral': 0,
    'calm': 1,
    'happy': 2,
    'sad': 3,
    'angry': 4,
    'fearful': 5,
    'disgust': 6,
    'surprised': 7
}

# --- 2. LOGICA DI DATA AUGMENT  ---
def spec_augment(img, label):
    """
    Applichiamo il mascheramento di frequenza e tempo sullo spettrogramma.
    """
    img = tf.cast(img, tf.float32)

    # Paramettri
    F = 20  # Larghezza massima della maschera di frequenza
    T = 20  # Larghezza massima della maschera temporale

    # Mascheramento della frequenza
    f = tf.random.uniform(shape=[], minval=0, maxval=F, dtype=tf.int32)
    v = img.shape[0] # Ascissa della frequenza
    f0 = tf.random.uniform(shape=[], minval=0, maxval=v - f, dtype=tf.int32)
    mask_freq = tf.concat([
        tf.ones([f0, img.shape[1], 1]),
        tf.zeros([f, img.shape[1], 1]),
        tf.ones([v - (f0 + f), img.shape[1], 1])
    ], axis=0)
    img = img * mask_freq

    # Mascheramento del tempo
    t = tf.random.uniform(shape=[], minval=0, maxval=T, dtype=tf.int32)
    h = img.shape[1] # Ascissa del tempo
    t0 = tf.random.uniform(shape=[], minval=0, maxval=h - t, dtype=tf.int32)
    mask_time = tf.concat([
        tf.ones([img.shape[0], t0, 1]),
        tf.zeros([img.shape[0], t, 1]),
        tf.ones([img.shape[0], h - (t0 + t), 1])
    ], axis=1)
    img = img * mask_time

    return img, label

# --- 3. CARICO E RISCALDAMENTO ---
def load_and_preprocess_data(data_path, batch_size, num_classes, is_training=True, augment=True):
    """
    Carica i file .npy e crea la pipeline tf.data.
    Se augment=False, non eseguire SpecAugment nella fase di addestramento.
    """
    prefix = 'train' if is_training else 'test'
    
    X = np.load(os.path.join(data_path, f'X_{prefix}.npy'))
    y = np.load(os.path.join(data_path, f'y_{prefix}.npy'))
    
    y_indices = np.array([LABEL_MAP[label] for label in y])
    y_hot = tf.keras.utils.to_categorical(y_indices, num_classes)
    
    ds = tf.data.Dataset.from_tensor_slices((X, y_hot))
    
    # Abilita shuffle e augmentation SOLO se is_training e augmentation papameters sono impostati su 'True'
    if is_training:
        ds = ds.shuffle(buffer_size=1000)
        if augment:
            ds = ds.map(spec_augment, num_parallel_calls=tf.data.AUTOTUNE)
    
    ds = ds.batch(batch_size).prefetch(buffer_size=tf.data.AUTOTUNE)
    
    return ds, len(X)
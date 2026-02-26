import tensorflow as tf
import numpy as np
import os

# --- 1. MAPPING OF LABLES ---
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

# --- 2. DATA AUGMENTATION LOGIC ---
def spec_augment(img, label):
    """
    Aplly Frequency and Time masking on the Spectrogram.
    """
    img = tf.cast(img, tf.float32)

    # Parameters
    F = 20  # Max Frequency Mask Width
    T = 20  # Max Time Mask Width

    # Frequency Masking
    f = tf.random.uniform(shape=[], minval=0, maxval=F, dtype=tf.int32)
    v = img.shape[0] # Freq axis
    f0 = tf.random.uniform(shape=[], minval=0, maxval=v - f, dtype=tf.int32)
    mask_freq = tf.concat([
        tf.ones([f0, img.shape[1], 1]),
        tf.zeros([f, img.shape[1], 1]),
        tf.ones([v - (f0 + f), img.shape[1], 1])
    ], axis=0)
    img = img * mask_freq

    # Time Masking
    t = tf.random.uniform(shape=[], minval=0, maxval=T, dtype=tf.int32)
    h = img.shape[1] # Time axis
    t0 = tf.random.uniform(shape=[], minval=0, maxval=h - t, dtype=tf.int32)
    mask_time = tf.concat([
        tf.ones([img.shape[0], t0, 1]),
        tf.zeros([img.shape[0], t, 1]),
        tf.ones([img.shape[0], h - (t0 + t), 1])
    ], axis=1)
    img = img * mask_time

    return img, label

# --- 3. LOAD AND WARM-UP ---
def load_and_preprocess_data(data_path, batch_size, num_classes, is_training=True, augment=True):
    """
    Load .npy files and create tf.data pipeline.
    If augment=False, don't do SpecAugment in training phase.
    """
    prefix = 'train' if is_training else 'test'
    
    X = np.load(os.path.join(data_path, f'X_{prefix}.npy'))
    y = np.load(os.path.join(data_path, f'y_{prefix}.npy'))
    
    y_indices = np.array([LABEL_MAP[label] for label in y])
    y_hot = tf.keras.utils.to_categorical(y_indices, num_classes)
    
    ds = tf.data.Dataset.from_tensor_slices((X, y_hot))
    
    # Enable shuffle and augmentation ONLY if is_training and augment papameters are setted to 'True'
    if is_training:
        ds = ds.shuffle(buffer_size=1000)
        if augment:
            ds = ds.map(spec_augment, num_parallel_calls=tf.data.AUTOTUNE)
    
    ds = ds.batch(batch_size).prefetch(buffer_size=tf.data.AUTOTUNE)
    
    return ds, len(X)
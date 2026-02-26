import tensorflow as tf
from tensorflow.keras import layers, models

# --- LIVELLO DI ATTENZIONE PERSONALIZZATO ---
class AttentionLayer(layers.Layer):
    def __init__(self, **kwargs):
        super(AttentionLayer, self).__init__(**kwargs)

    def build(self, input_shape):
        self.W = self.add_weight(name="att_weight", shape=(input_shape[-1], 1), initializer="normal")
        self.b = self.add_weight(name="att_bias", shape=(input_shape[1], 1), initializer="zeros")
        super(AttentionLayer, self).build(input_shape)

    def call(self, x):
        e = tf.keras.backend.tanh(tf.keras.backend.dot(x, self.W) + self.b)
        a = tf.keras.backend.softmax(e, axis=1)
        output = x * a
        return tf.keras.backend.sum(output, axis=1)

# --- COSTRUTTORE DI MODELLI IBRIDI ---
def build_attention_cnn_lstm(input_shape, num_classes):
    inputs = layers.Input(shape=input_shape)

    # PARTE A: CNN (Caratteristiche spaziali)
    # Blocco 1
    x = layers.Conv2D(32, (3, 3), padding='same', activation='relu')(inputs)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D(pool_size=(2, 2))(x)
    x = layers.Dropout(0.2)(x)
    
    # Blocco 2 
    x = layers.Conv2D(64, (3, 3), padding='same', activation='relu')(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D(pool_size=(2, 2))(x)
    x = layers.Dropout(0.2)(x)

    # Blocco 3
    x = layers.Conv2D(128, (3, 3), padding='same', activation='relu')(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D(pool_size=(2, 2))(x)
    x = layers.Dropout(0.3)(x)

    # PARTE B: RESHAPE FOR LSTM
    x = layers.Permute((2, 1, 3))(x)
    resize_shape = x.shape[1] 
    features_dim = x.shape[2] * x.shape[3]
    x = layers.Reshape((resize_shape, features_dim))(x)

    # PARTE C: LSTM (Caratteristiche temporali)
    x = layers.Bidirectional(layers.LSTM(128, return_sequences=True))(x)
    x = layers.Dropout(0.3)(x)

    # PARTE D: ATTENZIONE (Focus)
    x = AttentionLayer()(x)

    # PARTE E: CLASSIFICAZIONE
    x = layers.Dense(64, activation='relu')(x)
    x = layers.Dropout(0.4)(x)
    outputs = layers.Dense(num_classes, activation='softmax')(x)

    model = models.Model(inputs=inputs, outputs=outputs, name="Attn_CNN_LSTM")
    return model
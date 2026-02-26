import os
import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report
from models.model import build_attention_cnn_lstm
from data.dataset import load_and_preprocess_data, LABEL_MAP
from utils.visuals import plot_confusion_matrix

def run_evaluation(model_path, data_path, results_folder):
    # 1. Setup
    INPUT_SHAPE = (128, 128, 1)
    NUM_CLASSES = 8
    label_names = list(LABEL_MAP.keys())
    
    # Create the results folder if it doesn't exist
    results_path = os.path.join('checkpoints', results_folder)
    os.makedirs(results_path, exist_ok=True)

    # 2. Load data (Test Set)
    print(f"Loading data from: {data_path}")
    X_test = np.load(os.path.join(data_path, 'X_test.npy'))
    y_test = np.load(os.path.join(data_path, 'y_test.npy'))
    
    # Convert labels to numeric indices
    y_true = np.array([LABEL_MAP[l] for l in y_test])

    # 3. Load model
    print(f"Loading model from: {model_path}")
    # Advice: we use tf.keras.models.load_model if the file is a complete .keras, 
    # or build + load_weights if you saved the weights only.
    try:
        model = tf.keras.models.load_model(model_path)
    except:
        model = build_attention_cnn_lstm(INPUT_SHAPE, NUM_CLASSES)
        model.load_weights(model_path)

    # 4. Predictions
    print(" Prediction generation...")
    y_pred_probs = model.predict(X_test)
    y_pred = np.argmax(y_pred_probs, axis=1)

    # 5. Report and Matrix
    report = classification_report(y_true, y_pred, target_names=label_names)
    print("\n" + report)
    
    # Save report
    with open(os.path.join(results_path, 'evaluation_report.txt'), 'w') as f:
        f.write(report)
    
    # Confusion Matrix Save
    plot_confusion_matrix(y_true, y_pred, label_names, 
                          save_path=os.path.join(results_path, 'evaluation_cm.png'))
    
    print(f"Evaluation completed. Results saved in: {results_path}")

if __name__ == "__main__":
    print("="*40)
    print("      EVALUATION MODULE (VS Code)      ")
    print("="*40)
    print("1) Evaluate Actor Split Model")
    print("2) Evaluate Random Split Model")
    print("3) Evaluate Pure Dataset Model")
    
    scelta = input("\nSelect model to evaluate (1/2/3): ")

    if scelta == '1':
        m_path = 'checkpoints/res_ActorSplit/best_model.keras'
        d_path = 'dataset/augmentedDataset_9K_ActorSplit/'
        folder = 'res_ActorSplit'
    elif scelta == '2':
        m_path = 'checkpoints/res_RandomSplit/best_model.keras'
        d_path = 'dataset/augmentedDataset_9K_RandomSplit/'
        folder = 'res_RandomSplit'
    else:
        m_path = 'checkpoints/res_PureDataset/best_model.keras'
        d_path = 'dataset/pureDataset_RandomSplit/'
        folder = 'res_PureDataset'

    run_evaluation(m_path, d_path, folder)
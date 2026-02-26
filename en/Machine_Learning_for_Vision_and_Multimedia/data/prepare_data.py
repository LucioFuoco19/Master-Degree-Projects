import os
import glob
import numpy as np
import librosa
import random
from tqdm import tqdm
from sklearn.model_selection import train_test_split

# --- 1. CONFIGURATION ---
# We get the paths relative to the file location
Current_dir = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(Current_dir)
SOURCE_PATH = os.path.join(BASE_DIR, 'dataset', 'RawData')

EMOTIONS = {
    '01': 'neutral', '02': 'calm', '03': 'happy', '04': 'sad',
    '05': 'angry', '06': 'fearful', '07': 'disgust', '08': 'surprised'
}

# --- 2. AUGMENTATION FUNCTIONS ---
def add_noise(data, noise_factor_range=(0.005, 0.02)):
    noise_factor = np.random.uniform(*noise_factor_range)
    noise = np.random.randn(len(data))
    return data + noise_factor * noise

def shift_pitch(data, sr, pitch_factor_range=(-2.5, 2.5)):
    n_steps = np.random.uniform(*pitch_factor_range)
    return librosa.effects.pitch_shift(data, sr=sr, n_steps=n_steps)

def stretch_time(data, rate_range=(0.8, 1.2)):
    rate = np.random.uniform(*rate_range)
    return librosa.effects.time_stretch(y=data, rate=rate)

def shift_time(data, shift_max=0.2, sr=22050):
    shift_amt = int(np.random.uniform(-shift_max, shift_max) * sr)
    return np.roll(data, shift_amt)

def apply_random_augmentation(data, sr):
    augmented_data = data.copy()
    if random.random() < 0.5: augmented_data = stretch_time(augmented_data)
    if random.random() < 0.5: augmented_data = shift_pitch(augmented_data, sr)
    if random.random() < 0.8: augmented_data = add_noise(augmented_data)
    if random.random() < 0.5: augmented_data = shift_time(augmented_data, sr=sr)
    return augmented_data

# --- 3. FEATURE EXTRACTION ---
def get_mel_spectrogram(data, sr=22050, target_length=3.0):
    data, _ = librosa.effects.trim(data, top_db=20)
    target_samples = int(target_length * sr)
    if len(data) > target_samples:
        start = (len(data) - target_samples) // 2
        data = data[start : start + target_samples]
    else:
        data = np.pad(data, (0, max(0, target_samples - len(data))), 'constant')
    
    mel_spec = librosa.feature.melspectrogram(y=data, sr=sr, n_mels=128, n_fft=2048, hop_length=512)
    mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
    
    if mel_spec_db.shape[1] > 128:
        mel_spec_db = mel_spec_db[:, :128]
    else:
        mel_spec_db = np.pad(mel_spec_db, ((0, 0), (0, 128 - mel_spec_db.shape[1])), 'constant')
    return mel_spec_db[..., np.newaxis]

# --- 4. MAIN PROCESSING FUNCTION ---
def run_full_preparation(split_type="Actor Split", augment=True):
    # Dynamic definition of the folder name
    if not augment:
        folder_name = "pureDataset_RandomSplit"
    else:
        suffix = "ActorSplit" if split_type == "Actor Split" else "RandomSplit"
        folder_name = f'augmentedDataset_9K_{suffix}'
    
    save_path = os.path.join(BASE_DIR, 'dataset', folder_name)
    
    # === CHECK IF DATA ALREADY EXISTS ===
    required_files = ['X_train.npy', 'y_train.npy', 'X_test.npy', 'y_test.npy']
    exists = os.path.exists(save_path) and all(os.path.isfile(os.path.join(save_path, f)) for f in required_files)

    if exists:
        print(f"\n[INFO] The folder '{folder_name}' already contains the processed files.")
        choice = input("Do you want to reprocess the data and overwrite it? (y/n): ").lower()
        if choice != 'y':
            print("I skip data preparation.")
            return

    os.makedirs(save_path, exist_ok=True)
    
    # 1. File scan
    all_files = glob.glob(os.path.join(SOURCE_PATH, "Actor_*", "*.wav"))
    if not all_files:
        print(f"ERROR: No file found in {SOURCE_PATH}")
        return

    print(f"Found {len(all_files)} audio files. Mode: {split_type} (Augment: {augment})")

    # 2. Logic of Split of the originals
    labels_for_split = [EMOTIONS.get(os.path.basename(f).split('-')[2]) for f in all_files]
    if split_type == "Actor Split":
        train_files = [f for f in all_files if int(os.path.basename(f).split('-')[6].split('.')[0]) < 21]
        test_files = [f for f in all_files if int(os.path.basename(f).split('-')[6].split('.')[0]) >= 21]
    else:
        train_files, test_files = train_test_split(
            all_files, test_size=0.20, random_state=42, stratify=labels_for_split, shuffle=True
        )

    X_train, y_train, X_test, y_test = [], [], [], []

    # 3. Processing Loop
    for file_list, is_train in [(train_files, True), (test_files, False)]:
        desc = "Train" if is_train else "Test"
        for file_path in tqdm(file_list, desc=desc):
            emotion_label = EMOTIONS.get(os.path.basename(file_path).split('-')[2])
            data, sr = librosa.load(file_path, sr=22050)
            
            # Select destination container
            target_X = X_train if is_train else X_test
            target_y = y_train if is_train else y_test
            
            # Original Spectrogram Extraction
            target_X.append(get_mel_spectrogram(data, sr=sr))
            target_y.append(emotion_label)
            
            # Augmentation (Only if required and only for the Training set)
            if is_train and augment:
                num_aug = 12 if emotion_label == 'neutral' else 6
                for _ in range(num_aug):
                    aug_data = apply_random_augmentation(data, sr)
                    X_train.append(get_mel_spectrogram(aug_data, sr=sr))
                    y_train.append(emotion_label)

    # 4. Save
    np.save(os.path.join(save_path, 'X_train.npy'), np.array(X_train))
    np.save(os.path.join(save_path, 'y_train.npy'), np.array(y_train))
    np.save(os.path.join(save_path, 'X_test.npy'), np.array(X_test))
    np.save(os.path.join(save_path, 'y_test.npy'), np.array(y_test))
    
    print(f"\n Dataset saved in: {save_path}")
    print(f"Train Samples: {len(X_train)} | Test Samples: {len(X_test)}")

if __name__ == "__main__":
    print("="*30)
    print("DATA PREPARATION MENU")
    print("="*30)
    print("1) Actor Split (Augmented)")
    print("2) Random Split (Augmented)")
    print("3) Pure Dataset (No Augmentation, Random Split)")
    
    scelta = input("\n Select option (1/2/3): ")
    
    if scelta == '1':
        run_full_preparation(split_type="Actor Split", augment=True)
    elif scelta == '2':
        run_full_preparation(split_type="Random Split", augment=True)
    elif scelta == '3':
        run_full_preparation(split_type="Random Split", augment=False)
    else:
        print("Invalid choice.")
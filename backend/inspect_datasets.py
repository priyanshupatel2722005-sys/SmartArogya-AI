import pandas as pd

files = [
    "datasets/diabetes_prediction_dataset.csv",
    "datasets/heart_2020_cleaned.csv",
    "datasets/kidney_disease.csv",
]

for name in files:
    try:
        df = pd.read_csv(name)
        print("FILE", name)
        print(df.columns.tolist())
        print(df.head(2).to_dict("records"))
        print("-" * 60)
    except Exception as e:
        print("ERROR", name, e)

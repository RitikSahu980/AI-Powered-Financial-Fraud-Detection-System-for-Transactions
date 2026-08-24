import numpy as np
import pandas as pd

np.random.seed(42)

N = 300000

types = ["PAYMENT", "TRANSFER", "CASH_OUT", "CASH_IN", "DEBIT"]
type_probs = [0.45, 0.20, 0.20, 0.10, 0.05]

rows = []

for _ in range(N):
    t = np.random.choice(types, p=type_probs)
    step = np.random.randint(1, 744)

    # Transaction amount distribution
    if t == "PAYMENT":
        amount = np.random.uniform(100, 20000)
    elif t == "TRANSFER":
        amount = np.random.uniform(1000, 350000)
    elif t == "CASH_OUT":
        amount = np.random.uniform(1000, 400000)
    elif t == "CASH_IN":
        amount = np.random.uniform(500, 150000)
    else:  # DEBIT
        amount = np.random.uniform(100, 50000)

    # Origin account balances
    oldOrg = np.random.uniform(amount * 1.1, amount * 4 + 10000)
    newOrg = max(oldOrg - amount + np.random.normal(0, amount * 0.04), 0)

    # Destination account balances
    oldDest = np.random.uniform(0, 150000)
    newDest = oldDest + amount + np.random.normal(0, amount * 0.04)

    # -------------------------
    # Fraud risk calculation
    # -------------------------
    risk = 0.0

    # Transaction type risk
    if t == "TRANSFER":
        risk += 0.30
    elif t == "CASH_OUT":
        risk += 0.35
    elif t == "DEBIT":
        risk += 0.10

    # Progressive amount-based risk
    if amount > 10000:
        risk += 0.08
    if amount > 25000:
        risk += 0.12
    if amount > 50000:
        risk += 0.15
    if amount > 100000:
        risk += 0.20
    if amount > 200000:
        risk += 0.25
    if amount > 300000:
        risk += 0.15

    # Balance anomaly
    balance_diff = abs((oldOrg - newOrg) - amount)
    if balance_diff > amount * 0.10:
        risk += 0.15
    if balance_diff > amount * 0.25:
        risk += 0.10

    # Destination account anomaly
    if oldDest < 500 and amount > 50000:
        risk += 0.15

    # Random suspicious behavior
    if np.random.rand() < 0.08:
        risk += 0.10

    # Small noise for realism
    risk += np.random.normal(0, 0.05)

    # Keep risk between 0 and 1
    risk = np.clip(risk, 0, 1)

    # Generate fraud label
    fraud = np.random.rand() < risk

    # Flagged fraud (large fraudulent transactions)
    flagged = 1 if (fraud and amount > 200000) else 0

    rows.append([
        step,
        t,
        round(amount, 2),
        round(oldOrg, 2),
        round(newOrg, 2),
        round(oldDest, 2),
        round(newDest, 2),
        int(fraud),
        flagged,
    ])

# Create DataFrame
df = pd.DataFrame(
    rows,
    columns=[
        "step",
        "type",
        "amount",
        "oldbalanceOrg",
        "newbalanceOrig",
        "oldbalanceDest",
        "newbalanceDest",
        "isFraud",
        "isFlaggedFraud",
    ],
)

# Save dataset
df.to_csv("../modified_onlinefraud.csv", index=False)

print("Dataset created:", df.shape)
print(df["isFraud"].value_counts(normalize=True))
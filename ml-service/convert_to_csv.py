import pandas as pd

df = pd.read_excel("onlinefraud.xls", engine="xlrd")
print(df.head())
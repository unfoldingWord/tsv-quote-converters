import os
import glob
import csv

def check_tsv_files():
    tsv_files = sorted(glob.glob("tn_*.tsv"))
    for file in tsv_files:
        book = os.path.basename(file).split('_')[1].split('.')[0]
        bad_rows = []
        with open(file, 'r', encoding='utf-8') as tsvfile:
            reader = csv.reader(tsvfile, delimiter='\t')
            header = next(reader)  # Skip the header row
            bad_rows.append(header)
            for row in reader:
                if len(row) > 5 and row[4].strip() and not row[5].strip():
                    bad_rows.append(row)
        if len(bad_rows) > 1:
            with open(f'tn_{book}_bad_quotes.tsv', 'w', encoding='utf-8', newline='') as badfile:
                writer = csv.writer(badfile, delimiter='\t')
                writer.writerows(bad_rows)

if __name__ == "__main__":
    check_tsv_files()

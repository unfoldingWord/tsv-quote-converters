const tsvRowToObject = entry => {
    const [n, row] = entry;
    return {
        n: n,
        ref: row[0],
        id: row[1],
        tags: row[2],
        supportReference: row[3],
        quote: row[4],
        occurrence: row[5],
        note: row[6],
    }
}

export const parseTsvToObjects = content => {
    const tsvEntries = content
        .split("\n")
        .filter(r => r.trim())
        .map(r => r.split("\t"))
        .entries();
    return [...tsvEntries]
        .map(r => tsvRowToObject(r))
}

export const tsvRecordToString = record => {
    return `${record.ref}\t${record.id}\t${record.tags}\t${record.supportReference}\t${record.quote}\t${record.occurrence}\t${record.note}`;
}

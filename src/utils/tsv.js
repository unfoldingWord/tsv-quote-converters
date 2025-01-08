const tsvRowToObject = entry => {
    const [n, row] = entry;
    return {
        n: n,
        ref: row[0],
        id: row[1],
        tags: row[2],
        supportReference: row[3],
        quote: row[4],
        occurrence: parseInt(row[5]) || 0,
        glQuote: row[6],
        glOccurrence: parseInt(row[7]) || 0,
        note: row[8],
    }
}

export const parseTsvToObjects = content => {
    const tsvEntries = content
        .split("\n")
        .filter(r => r.trim())
        .map(r => {
            let items = r.split("\t");            
            if (items.length == 7) {
                items.splice(6, 0, '');
                items.splice(7, 0, 0);
            }
            return items
        })
        .entries();
    return [...tsvEntries]
        .map(r => tsvRowToObject(r))
}

export const tsvRecordToTSV7String = record => {
    return `${record.ref}\t${record.id}\t${record.tags}\t${record.supportReference}\t${record.quote}\t${record.occurrence}\t${record.note}`;
}

export const tsvRecordToTSV9String = record => {
    return `${record.ref}\t${record.id}\t${record.tags}\t${record.supportReference}\t${record.quote}\t${record.occurrence}\t${record.glQuote}\t${record.glOccurrence}\t${record.note}`;
}

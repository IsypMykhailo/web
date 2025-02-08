export function groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
        const key = keyGetter(item);
        const strKey = JSON.stringify(key);
        const collection = map.get(Array.from(map.keys()).find((k) => JSON.stringify(k) === strKey));

        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    return map;
}
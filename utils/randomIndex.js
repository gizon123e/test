module.exports = function getRandomIndices(array, n) {
    if (n > array.length) {
        throw new Error("n tidak boleh lebih besar dari panjang array");
    }
    
    const indices = [];
    const usedIndices = new Set();
    
    while (indices.length < n) {
        const randomIndex = Math.floor(Math.random() * array.length);
        if (!usedIndices.has(randomIndex)) {
            indices.push(randomIndex);
            usedIndices.add(randomIndex);
        };
    }
    
    return indices;
}
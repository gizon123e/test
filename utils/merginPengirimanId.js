module.exports = function mergeObjectsByStoreId(arr) {
    let mergedObject = {};

    arr.forEach(item => {
        if (mergedObject.id_toko && mergedObject.id_toko.equals(item.id_toko)) {

            mergedObject.productToDelivers = [
                ...mergedObject.productToDelivers,
                ...item.productToDelivers
            ];
            
            mergedObject.total_ongkir += item.total_ongkir;
            
            mergedObject.ongkir += item.ongkir;
            
            mergedObject.amountCapable += item.amountCapable;
        } else {
            mergedObject = { ...item };
        }
    });

    return mergedObject;
}
var util = {
    version: '.01',
    sort: function(array, member) {
        var compare = function(a, b) {
            return util.compareMember(a, b, member);
        };
        array.sort(compare);
    },
    compareMember: function(a, b, member) {
        if(a[member] > b[member]) {
            return 1;
        }
        if(a[member] < b[member]) {
            return -1;
        }
        return 0;
    },
    duplicateIndexes: function(array, member) {
        util.sort(array, member);
        var dupIndexes = [];
        for(var i = 1; i < array.length; i++){
            if(array[i-1][member] == array[i][member]) {
                if(i-1 === 0) {
                    dupIndexes.push(i-1);
                } else if (array[i-2][member] != array[i-1][member]) {
                    dupIndexes.push(i-1);
                }
            }
        }
        return dupIndexes;
    },
};

module.exports = {

    factory: function(context) {
        util.appFramework = context;
        return  this.duplicates;
    },

    duplicates: function(array, member) {
        var duplicates = [];
        var dupIndexes = util.duplicateIndexes(array, member);
        for(var index = 0; index < dupIndexes.length; index++){
            var dups = [];
            dups.push(array[dupIndexes[index]]);
            for(var i = dupIndexes[index] +1; i < array.length && array[i][member] == array[i-1][member]; i++){
                dups.push(array[i]);
            }
            duplicates.push({name: array[dupIndexes[index]][member], users: dups, merge: false});
        }
        return duplicates;
    },
};


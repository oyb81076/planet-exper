var obj = {key: "string"};
var tmp;
var n = 1e7;

console.time("no with");
for (var i=0; i<n; i++) {
    tmp = obj.key;
}
console.timeEnd("no with");

console.time("with");
with (obj) {
    for (var i=0; i<n; i++) {
        tmp = key;
    }
}
console.timeEnd("with");

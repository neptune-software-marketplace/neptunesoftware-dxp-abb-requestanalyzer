const fs = modules.fs;

const dirName = "./log/requests/";
const filesNames = fs.readdirSync(dirName, "utf8");

let files = [];

filesNames?.forEach(function (fileName) {
    files.push({
        name: fileName,
    });
});

result.data = files;

complete();

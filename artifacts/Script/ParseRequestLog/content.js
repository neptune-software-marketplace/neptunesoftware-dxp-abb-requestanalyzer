const fs = modules.fs;

const fileName = "./log/requests/" + req.query.fileName;
const fileContent = fs.readFileSync(fileName, "utf8");
const fileFormatted = fileContent.split("\n").reverse();

const neptunePaths = [
    "/api/functions",
    "/public/icons",
    "/public/openui5",
    "/public/webix",
    "/views/",
    "/api/formatter",
    "/adaptivedesigner",
    "/appdesigner",
    "/scripteditor",
    "/cockpit",
    "/api/user",
    "/api/scripteditor/",
    "/public/themes",
    "/user/logon",
    "/public/images",
    "/sm/",
    "/favicon.ico",
];

let logContent = [];
let topUrl = {};
let users = {};
let reqOK = 0;
let reqNOK = 0;
let totReq = 0;
let totDuration = 0;

try {
    fileFormatted.forEach((element) => {
        if (!element) return;

        let log;

        try {
            log = JSON.parse(element);
        } catch (e) {}

        // Filter - Parameters
        if (req.query.pathing === "without") {
            log.message.request.url = log.message.request.url.split("?")[0];
        }

        // Filter - Period
        if (
            req.query?.minutes !== "All" &&
            !isWithinLastMinutes(log.message.request.timestamp, req.query.minutes)
        ) {
            return;
        }

        // Filter - Exclude Neptune
        if (req.query.show === "exclude") {
            if (neptunePaths.some((value) => log.message.request.url.includes(value))) {
                return;
            }
        }

        // Filter - Show Only Neptune
        if (req.query.show === "include") {
            if (!neptunePaths.some((value) => log.message.request.url.includes(value))) {
                return;
            }
        }

        // Request Path
        const path = log.message.request.url;

        if (!topUrl[path])
            topUrl[path] = {
                requests: 0,
                duration: 0,
                errors: 0,
            };
        topUrl[path].requests++;
        topUrl[path].duration = topUrl[path].duration + log.message.response.duration;

        if (log.message.response.statusCode === 200) {
            reqOK++;
        } else {
            reqNOK++;
            topUrl[path].errors++;
        }

        // Request Users
        if (log.message.user.username) {
            if (!users[log.message.user.username])
                users[log.message.user.username] = {
                    requests: 0,
                    duration: 0,
                    errors: 0,
                };
            users[log.message.user.username].requests++;
            users[log.message.user.username].duration =
                users[log.message.user.username].duration + log.message.response.duration;
        }

        totReq++;
        totDuration = totDuration + log.message.response.duration;
    });

    const urlList = convertToList(topUrl, "url");
    const usersList = convertToList(users, "username");

    result.data = {
        urlList,
        usersList,
        requestInfo: {
            reqOK,
            reqNOK,
            totReq,
            totDuration: (totDuration / 1000).toFixed(2),
        },
    };
} catch (e) {
    result.data = {
        error: e,
    };
}

complete();

function isWithinLastMinutes(logtime, minutes) {
    const timestamp = new Date(logtime).getTime();
    const currentTime = new Date().getTime();
    const timeDifference = currentTime - timestamp;
    const minutesDifference = timeDifference / (1000 * 60);
    return minutesDifference <= minutes;
}

function convertToList(objectKeys, keyField) {
    const keyValueArray = Object.entries(objectKeys);
    keyValueArray.sort((a, b) => b[1] - a[1]);
    const sortedJsonObject = Object.fromEntries(keyValueArray);

    const Items = [];

    for (const key in sortedJsonObject) {
        let rec = {
            requests: sortedJsonObject[key].requests,
            duration: parseFloat(sortedJsonObject[key].duration.toFixed(2)),
            errors: sortedJsonObject[key].errors,
        };

        rec[keyField] = key;

        Items.push(rec);
    }

    Items?.forEach(function (item) {
        item.avg = item.duration / item.requests;
    });

    return Items;
}

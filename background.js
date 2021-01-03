
var allDownloadIntervals = {};
var domainWhiteList = "";
var appendTimestamp = true;
var deleteCSV = false;

chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.get({
        domainWhiteList: '',
        appendTimestamp: true,
        deleteCSV: false,
        }, function (userOptions) {
            domainWhiteList = userOptions.domainWhiteList;
            appendTimestamp = userOptions.appendTimestamp;
            deleteCSV = userOptions.deleteCSV;
    });
});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(request)
        domainWhiteList = request.domainWhiteList;
        appendTimestamp = request.appendTimestamp;
        deleteCSV = request.deleteCSV;
        sendResponse({ Message: "Options Updated Successfully" });
    }
);

chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
    if (captureDownload(downloadItem)) {
        if (appendTimestamp) {
            var newCsvFileName = downloadItem.filename.split('.').slice(0, -1).join('.') + "_" + formatDate(new Date()) + "." + downloadItem.filename.split('.')[1];
            suggest({ filename: newCsvFileName, conflictAction: "uniquify" });
        }
    }
});

chrome.downloads.onCreated.addListener(function (downloadItem) {
    if (captureDownload(downloadItem)) {
        allDownloadIntervals[downloadItem.id] = setInterval(function () { getProgress(downloadItem.id); }, 1000);
    }
});

function captureDownload(downloadItem) {

    var convertCSV = false;

    //mime type of 'application/comma-separated-values' for netsuite.com
    if ((downloadItem.mime == "text/csv" || downloadItem.mime == "application/comma-separated-values") && downloadItem.state == "in_progress") {
        var allWhitelistedDomains = domainWhiteList.split(',').map(function (item) {
            return item.trim();
        });

        allWhitelistedDomains = allWhitelistedDomains.filter(function (el) {
            return el != null && el != "";
        });

        if (allWhitelistedDomains.length > 0) {
            var trackDownload = true;
            allWhitelistedDomains.forEach(element => {
                if (downloadItem.referrer.toLowerCase().indexOf(element.toLowerCase()) >= 0 && trackDownload) {
                    trackDownload = false;
                    convertCSV = true;
                }
            });
        }
        else {
            convertCSV = true;
        }
    }

    return convertCSV;
}

function getProgress(downloadId) {
    chrome.downloads.search({ id: downloadId }, function (item) {
        if (item.length > 0 && item[0].state == "complete") {
            onDownloadFinished(item[0]);
            clearInterval(allDownloadIntervals[item[0].id])
        }
    });
}

let formatDate = (d, a = d.toString().split` `) => a[2] + "-" + a[1] + "-" + a[3] + "-" + a[4].replaceAll(":", "-");

function onDownloadFinished(item) {

    var readXmlRequest = new XMLHttpRequest();
    readXmlRequest.onreadystatechange = function () {
        if (readXmlRequest.readyState == 4) {
            csvString = readXmlRequest.responseText;
            var result = Papa.parse(csvString, {
                dynamicTyping: true
            });

            var resultXlsxObject = [];
            resultXlsxObject = result.data.map((currentRow) => {
                return currentRow.map((currentColumn) => {
                    var typeOfObject = typeof (currentColumn) == "string" || typeof (currentColumn) == "number" ? typeof (currentColumn) : "string";
                    return { value: currentColumn, type: typeOfObject };
                })
            });

            var xlsxFileName = item.filename.replace(/^.*[\\\/]/, '').split('.').slice(0, -1).join('.');

            const config = {
                filename: xlsxFileName,
                sheet: {
                    data: resultXlsxObject
                }
            };

            zipcelx(config);

            if (deleteCSV) {
                chrome.downloads.removeFile(item.id, function (removedFile) {
                    console.log("CSV File Deleted Successfully");
                });
            }
        }
    };

    readXmlRequest.open("GET", item.filename, true);
    readXmlRequest.send();
}
// saves options to chrome.storage
function save_options() {

    var sites = document.getElementById('txtDomainWhiteList').value;
    var chkDeleteCSV = document.getElementById('chkDeleteCSV').checked;
    var chkAppendTimeStamp = document.getElementById('chkAppendTimeStamp').checked;

    chrome.storage.sync.set({
        domainWhiteList: sites,
        deleteCSV: chkDeleteCSV,
        appendTimestamp: chkAppendTimeStamp
        }, function () {
            chrome.runtime.sendMessage({
            domainWhiteList: sites,
            deleteCSV: chkDeleteCSV,
            appendTimestamp: chkAppendTimeStamp
            }, function (response) {
                console.log(response.Message);
    });

    var status = document.getElementById('status');
    status.textContent = 'Options Saved Successfully.';
    setTimeout(function () {status.textContent = '';}, 2000);

  });
}

//defaults
function restore_options() {
    chrome.storage.sync.get({
        domainWhiteList: '',
        deleteCSV: false,
        appendTimestamp: true
        }, function (items) {
            document.getElementById('txtDomainWhiteList').value = items.domainWhiteList;
            document.getElementById('chkDeleteCSV').checked = items.deleteCSV;
            document.getElementById('chkAppendTimeStamp').checked = items.appendTimestamp;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);

document.getElementById('save').addEventListener('click',save_options);
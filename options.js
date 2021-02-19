// saves options to chrome.storage
function save_options() {

    var sites = document.getElementById('txtDomainWhiteList').value;
    var chkDeleteCSV = document.getElementById('chkDeleteCSV').checked;
    var chkAppendTimeStamp = document.getElementById('chkAppendTimeStamp').checked;
    var chkRemoveTrailingNumbers = document.getElementById('chkRemoveTrailingNumbers').checked;
    var chkAddSpaceWhenCharacterCaseChange = document.getElementById('chkAddSpaceWhenCharacterCaseChange').checked;

    chrome.storage.sync.set({
        domainWhiteList: sites,
        deleteCSV: chkDeleteCSV,
        appendTimestamp: chkAppendTimeStamp,
        removeTrailingNumbers: chkRemoveTrailingNumbers,
        addSpaceWhenCharacterCaseChange: chkAddSpaceWhenCharacterCaseChange
        }, function () {
            chrome.runtime.sendMessage({
            domainWhiteList: sites,
            deleteCSV: chkDeleteCSV,
            appendTimestamp: chkAppendTimeStamp,
            removeTrailingNumbers: chkRemoveTrailingNumbers,
            addSpaceWhenCharacterCaseChange: chkAddSpaceWhenCharacterCaseChange
            }, function (response) {
                console.log(response.Message);
    });

    var status = document.getElementById('status');
    status.textContent = 'Options Saved Successfully.';
    setTimeout(function () {status.textContent = '';}, 2000);

  });
}

function cancel_dialog() {
    window.close();
}

//defaults
function restore_options() {
    chrome.storage.sync.get({
        domainWhiteList: '',
        deleteCSV: false,
        appendTimestamp: true,
        removeTrailingNumbers: false,
        addSpaceWhenCharacterCaseChange: false
        }, function (items) {
            document.getElementById('txtDomainWhiteList').value = items.domainWhiteList;
            document.getElementById('chkDeleteCSV').checked = items.deleteCSV;
            document.getElementById('chkAppendTimeStamp').checked = items.appendTimestamp;
            document.getElementById('chkRemoveTrailingNumbers').checked = items.removeTrailingNumbers;
            document.getElementById('chkAddSpaceWhenCharacterCaseChange').checked = items.addSpaceWhenCharacterCaseChange;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);

document.getElementById('save').addEventListener('click', save_options);
document.getElementById('cancel').addEventListener('click', cancel_dialog);
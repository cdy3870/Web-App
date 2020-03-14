function clearItemForm() {
    document.getElementById("weekly_price").value = '';
    document.getElementById("title").value = '';
}

function itemSaved(result, targetUrl, params) {
    if (result && result.ok) {
        console.log("Saved item.");
        clearItemForm();
        loadItems();
    } else {
        console.log("Received error: " + result.error);
        showError(result.error);
    }
}

function displayList(result, targetUrl) {
    if (result && result.length) {
        let text = '<ul>';
        for (var i = 0; i < result.length; i++) {
        text += '<li id="li_' + result[i].id + '">';
        text += '<button onclick="editItem(\'' + result[i].id + '\');">edit</button> ';
        text += '<button onclick="deleteItem(\'' + result[i].id + '\');">x</button> ';
        text += result[i].quantity + ') ' + result[i].title;
        text += '</li>';
        }
        text += '</ul>';
        console.log("updating DisplayArea: " + text);
        document.getElementById("DisplayArea").innerHTML = text;
    } else {
        document.getElementById("DisplayArea").innerHTML = 'No list items.';
    }

}

function saveItem(id) {
    let params = {};
    if (id) {
        params['id'] = id;
        params['quantity'] = document.getElementById("edit_item_quantity").value;
        params['title'] = document.getElementById("edit_item_title").value;
    } else {
        // if no ID is supplied this is creating a new item.
        params['quantity'] = document.getElementById("weekly_price").value;
        params['title'] = document.getElementById("title").value;
    }
    
    sendJsonRequest(params, '/save-item', itemSaved);
}

function loadItems() {
    alert(display)
    getData('/load-items', displayList);
}

function getData(targetUrl, callbackFunction) {
    let xmlHttp = createXmlHttp();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4) {
            // note that you can check xmlHttp.status here for the HTTP response code
            try {
                let myObject = JSON.parse(xmlHttp.responseText);
                callbackFunction(myObject, targetUrl);
            } catch (exc) {
                console.log("There was a problem at the server.");
            }
        }
    }
    xmlHttp.open("GET", targetUrl, true);
    xmlHttp.send();
}

function createXmlHttp() {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (!(xmlhttp)) {
        alert("Your browser does not support AJAX!");
    }
    return xmlhttp;
}




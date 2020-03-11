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
    sendJsonRequest(params, '/upload', itemSaved);
}

function loadItems() {
    console.log("loading items")
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


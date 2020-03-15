//Saving Items
function saveItem(id) {
    let params = {};
    if (id) {
        params['id'] = id;
        params['quantity'] = document.getElementById("edit_item_quantity").value;
        params['title'] = document.getElementById("edit_item_title").value;
    } else {
        // if no ID is supplied this is creating a new item.
        params['description'] = document.getElementById("description").value;
        params['monthly_price'] = document.getElementById("monthly_price").value;
        params['daily_price'] = document.getElementById("daily_price").value;
        params['weekly_price'] = document.getElementById("weekly_price").value;
        params['title'] = document.getElementById("title").value;
    }
    sendJsonRequest(params, '/save-item', itemSaved);
}

//Loading Items
function loadItems() { 
    getData('/load-items', displayList);
}

//Creating XmlHTTP
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

//Getting JSON Responses
function getData(targetUrl, callbackFunction) {
    let xmlHttp = createXmlHttp();
    
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4) {
            console.log(xmlHttp.responseText);
            // note that you can check xmlHttp.status here for the HTTP response code
            try {
                let myObject = JSON.parse(xmlHttp.responseText);
                callbackFunction(myObject, targetUrl);
            } catch (exc) {
                console.log(exc);
                console.log("There was a problem at the server!");
            }
        }
    }
    xmlHttp.open("GET", targetUrl, true);
    xmlHttp.send();
}

//Sending JSON Requests
function sendJsonRequest(parameterObject, targetUrl, callbackFunction) {
    var xmlHttp = createXmlHttp();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4) {
            console.log(xmlHttp.responseText);
            var myObject = JSON.parse(xmlHttp.responseText);
            callbackFunction(myObject, targetUrl, parameterObject);
        }
    }
    console.log(targetUrl);
    console.log(parameterObject);
    postParameters(xmlHttp, targetUrl, objectToParameters(parameterObject));
}

function postParameters(xmlHttp, target, parameters) {
    if (xmlHttp) {
        xmlHttp.open("POST", target, true); // XMLHttpRequest.open(method, url, async)
        var contentType = "application/x-www-form-urlencoded";
        xmlHttp.setRequestHeader("Content-type", contentType);
        xmlHttp.send(parameters);
    }
}


function objectToParameters(obj) {
    var text = '';
    for (var i in obj) {
        // encodeURIComponent is a built-in function that escapes to URL-safe values
        text += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]) + '&';
    }
    return text;
}

//Loading Items Helper Methods
function displayList(result, targetUrl) {
    
    if (result && result.length) {
        let text = '<ul>';
        let table = document.getElementById("ItemTable");
        for (var i = 0; i < result.length; i++) {
            let row = table.insertRow();           
            let cell = row.insertCell();
            let text = document.createTextNode(result[i].title)
            cell.appendChild(text);
            cell = row.insertCell();
            text = document.createTextNode(result[i].daily_price)
            cell.appendChild(text);
            cell = row.insertCell();
            text = document.createTextNode(result[i].weekly_price)
            cell.appendChild(text);
            cell = row.insertCell();
            text = document.createTextNode(result[i].monthly_price)
            cell.appendChild(text);

            var button = document.createElement("button");
            button.innerHTML = "View";
            button.addEventListener ("click", function() {
                document.getElementById("details") = result[i].description;
            });
            cell = row.insertCell();
            cell.appendChild(button)


            
            
            
        //text += '<li id="li_' + result[i].id + '">';
        //text += '<button onclick="editItem(\'' + result[i].id + '\');">edit</button> ';
        //text += '<button onclick="deleteItem(\'' + result[i].id + '\');">x</button> ';
        //text += result[i].title + ' ' + result[i].daily_price + ' ' + result[i].weekly_price + ' ' + result[i].monthly_price;
        //text += '</li>';
        }
        //text += '</ul>';
        console.log("updating DisplayArea: " + text);
        //document.getElementById("ItemList").innerHTML = text;
        

    } else {
        //document.getElementById("ItemList").innerHTML = 'No list items.';
    }

}

function showDetails(description){
    document.getElementById("details") = description;
}

//Saving Items Helper Methods
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






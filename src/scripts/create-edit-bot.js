let botNamePopup, botNameEle, botNameErr, addEventEle, EventPopup, saveEventEle, saveEventErr;
var coordinate = [], editIdx = -1, delIdx = -1;

var url = new URL(window.location.href);
var param = url.searchParams.get("edit");
if(param) {
    var editBotIdx = parseInt(param);
}
if(typeof(editBotIdx) != 'undefined') {
    // Edit mode
    eel.editBot(editBotIdx)(function(data) {
        update(data["events"]);
    })
}

// DOM Manupulation Functions and event-listeners
document.addEventListener("DOMContentLoaded", function(event) {
    botNamePopup = document.getElementById('bot_name_popup');
    botNameEle = document.getElementById('bot_name');
    botNameErr = document.getElementById('bot_name_err');
    addEventEle = document.getElementById('add_event');
    EventPopup = document.getElementById('event_popup');
    saveEventErr = document.getElementById('create_event_err');

    // Create mode
    if(!param) {
        document.title = "Create Bot";
        document.getElementById('heading').innerHTML = "Create a new Bot";
        botNamePopup.style.display = "flex";
    }

    // Prefill/reset the data for create event
    addEventEle.addEventListener('click', function() {
        editIdx = -1;

        document.getElementById('event_name').value = '';
        document.getElementById('event_type').value = '';
        document.getElementById('x').innerText = '--';
        document.getElementById('y').innerText = '--';
        document.getElementById('sleep').value = '0.1';
        document.getElementById('typewrite_text').value = '';
        coordinate = [];
        
        EventPopup.style.display = "flex";
        saveEventErr.innerText = '';
        
        document.querySelector('.pos').style.display = 'flex';
        document.querySelector('.typewrite').style.display = 'none';
        document.querySelector('.hotkeys').style.display = 'none';
    })
    
    // on enter press in botname input, call createBot() function
    botNameEle.addEventListener('keyup', function(e) {
        if(e.keyCode == 13) {
            createBot();
        }
    })
});

// Create a new file for entered botname by User
function createBot() {
    var botname = botNameEle.value;
    if(botname) {
        botname = botname.toLowerCase();
        eel.createNewBot(botname)(function(error) {
            if(!error) {
                botNamePopup.style.display = "none";
            } else {
                botNameErr.innerText = error;
                botNameErr.style.display = "block";
            }
        })
    } else {
        botNameErr.innerText = "Required";
        botNameErr.style.display = "block";
    }
}

// get cursor position on screen => [CTRL] + [ENTER]
window.addEventListener('keyup', function(e) {
    if(e.ctrlKey && e.keyCode == 13) {
        eel.getCurrPos()(function(pos) {
            document.getElementById('x').innerText = pos[0];
            document.getElementById('y').innerText = pos[1];
            coordinate = pos;
        });
    }
}, false);

// Change Event type
function changeEventType() {
    var eventType = document.getElementById('event_type').value;
    if(eventType == '' || eventType == 'click' || eventType == 'right_click' || eventType == 'double_click' || eventType == 'triple_click') {
        document.querySelector('.pos').style.display = 'flex';
        document.querySelector('.typewrite').style.display = 'none';
        document.querySelector('.hotkeys').style.display = 'none';
    } else if(eventType == 'type_write') {
        document.querySelector('.pos').style.display = 'none';
        document.querySelector('.typewrite').style.display = 'flex';
        document.querySelector('.hotkeys').style.display = 'none';
    } else if(eventType == 'hotkeys') {
        document.querySelector('.pos').style.display = 'none';
        document.querySelector('.typewrite').style.display = 'none';
        document.querySelector('.hotkeys').style.display = 'flex';
    }
}

// Update Event
function update(allEvents) {
    document.getElementById('events').innerHTML =
    `<div class="event_list_row">
        <span>Event Name</span>
        <span>Event Type</span>
        <span>Action</span>
        <span>Sleep after event</span>
    </div>`;
    for(var i=0; i<allEvents.length; i++) {
        addEventToDOM(allEvents[i], i);
    }
}

// Create new Event
function saveEvent() {
    var eventName = document.getElementById('event_name').value;
    var eventType = document.getElementById('event_type').value;
    var typewriteText = document.getElementById('typewrite_text').value;
    var hotkeys = [];
    var key1 = document.getElementById('key1').value;
    var key2 = document.getElementById('key2').value;
    var key3 = document.getElementById('key3').value;
    if(key1) {hotkeys.push(key1)};
    if(key2) {hotkeys.push(key2)};
    if(key3) {hotkeys.push(key3)};
    var sleepTime = document.getElementById('sleep').value;
    if(!(eventName && sleepTime && ( (eventType != 'type_write' && coordinate && typeof(coordinate[0]) != 'undefined' && typeof(coordinate[1]) != 'undefined')  || (eventType == 'type_write' && typewriteText) || (hotkeys.length > 0)))) {
        saveEventErr.innerText = (hotkeys.length) ? 'All fields required' : 'Please select atleast on key';
        saveEventErr.style.display = 'block';
        return;
    }
    if(sleepTime < 0.1 || sleepTime > 300) {
        saveEventErr.innerText = 'Sleep time must be between 0.1 to 300 sec';
        saveEventErr.style.display = 'block';
        return;
    }
    var event = {
        name: eventName,
        type: eventType,
        position: coordinate,
        text: typewriteText,
        hotkeys: hotkeys,
        sleep: sleepTime,
    }
    eel.createEditEvent(event, editIdx)(function(allEvents) {
        update(allEvents)
    });
}

// Add newly created event to DOM
function addEventToDOM(event, i) {
    if(event.type == 'type_write') {
        var eventHTML = `
        <div class="event_list_row">
            <span>${event.name}</span>
            <span>${getDisplayNameOfEvent(event.type)}</span>
            <span>${getDisplayText(event.text)}</span>
            <span>${event.sleep} sec</span>
            <span class="editDelOpt">
                <img title="Edit" class="cursor" onclick="edit(${i})" src="../assets/edit_black_24dp.svg">
                <img title="Delete" class="cursor" onclick="del(${i})"  src="../assets/delete_black_24dp.svg">
            </span>
        </div>`;
    } else if(event.type == 'hotkeys') {
        var keyHTML = '';
        if(event.hotkeys.length > 0) {keyHTML += `<kbd>${event.hotkeys[0]}</kbd>`};
        if(event.hotkeys.length > 1) {keyHTML += `&nbsp;+&nbsp;<kbd>${event.hotkeys[1]}</kbd>`};
        if(event.hotkeys.length > 2) {keyHTML += `&nbsp;+&nbsp;<kbd>${event.hotkeys[2]}</kbd>`};
        var eventHTML = `
        <div class="event_list_row">
        <span>${event.name}</span>
        <span>${getDisplayNameOfEvent(event.type)}</span>
        <span style="flex-wrap: wrap;">${keyHTML}</span>
        <span>${event.sleep} sec</span>
            <span class="editDelOpt">
                <img title="Edit" class="cursor" onclick="edit(${i})" src="../assets/edit_black_24dp.svg">
                <img title="Delete" class="cursor" onclick="del(${i})" src="../assets/delete_black_24dp.svg">
            </span>
        </div>`;
    } else {
        var eventHTML = `
        <div class="event_list_row">
            <span>${event.name}</span>
            <span>${getDisplayNameOfEvent(event.type)}</span>
            <span>X: ${event.position[0]}, Y: ${event.position[1]}</span>
            <span>${event.sleep} sec</span>
            <span class="editDelOpt">
                <img title="Edit" class="cursor" onclick="edit(${i})" src="../assets/edit_black_24dp.svg">
                <img title="Delete" class="cursor" onclick="del(${i})" src="../assets/delete_black_24dp.svg">
            </span>
        </div>`;
    }
    EventPopup.style.display = "none";
    document.getElementById('events').insertAdjacentHTML('beforeend', eventHTML);
}

// get display name of Event
function getDisplayNameOfEvent(name) {
    if(name == 'click') {
        return 'Click';
    } else if(name == 'right_click') {
        return 'Right Click';
    } else if(name == 'double_click') {
        return 'Double Click';
    } else if(name == 'triple_click') {
        return 'Triple Click';
    } else if(name == 'type_write') {
        return 'Type Write';
    } else if(name == 'hotkeys') {
        return 'Press Keys';
    } else if(name == 'sleep') {
        return 'Sleep';
    } else {
        return '';
    }
}

// get display text
function getDisplayText(text) {
    if(text && text.length > 15) {
        var displayText = text.substring(0,12) + '...';
        return displayText;
    }
    return text;
}

// Cancel creating new Event
function cancel() {
    EventPopup.style.display = "none";
}

// Edit Event
function edit(idx) {
    editIdx = idx;
    eel.getEventData(idx)(function(data) {
        document.getElementById('event_name').value = data.name;
        document.getElementById('event_type').value = data.type;
        document.getElementById('sleep').value = data.sleep;
        if(data.type == 'type_write') {
            document.getElementById('typewrite_text').value = data.text;

            document.querySelector('.pos').style.display = 'none';
            document.querySelector('.typewrite').style.display = 'flex';
            document.querySelector('.hotkeys').style.display = 'none';
        } else if(data.type == 'hotkeys') {
            if(data.hotkeys.length > 0) {document.getElementById('key1').value = data.hotkeys[0]};
            if(data.hotkeys.length > 1) {document.getElementById('key2').value = data.hotkeys[1]};
            if(data.hotkeys.length > 2) {document.getElementById('key3').value = data.hotkeys[2]};

            document.querySelector('.pos').style.display = 'none';
            document.querySelector('.typewrite').style.display = 'none';
            document.querySelector('.hotkeys').style.display = 'flex';
        } else {
            document.getElementById('x').innerText = data.position[0];
            document.getElementById('y').innerText = data.position[0];
            coordinate = data.position;
            
            document.querySelector('.pos').style.display = 'flex';
            document.querySelector('.typewrite').style.display = 'none';
            document.querySelector('.hotkeys').style.display = 'none';
        }
        
        EventPopup.style.display = "flex";
        saveEventErr.innerText = '';
    })
}

// Delete Event
function del(idx) {
    document.getElementById('del_modal').style.display = "flex";
    delIdx = idx;
}
function delEvent() {
    eel.delEvent(delIdx)(function(allEvents) {
        if(allEvents) {
            update(allEvents);
        }
        document.getElementById('del_modal').style.display = "none";
    })
}
function cancelDelEvent() {
    document.getElementById('del_modal').style.display = "none";
}
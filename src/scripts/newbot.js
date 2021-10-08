let botNameEle, botNameErr, addEventEle, saveEventEle, saveEventErr;
var coordinate = [];

// DOM Manupulation Functions and event-listeners
document.addEventListener("DOMContentLoaded", function(event) {
    botNameEle = document.getElementById('bot_name');
    botNameErr = document.getElementById('bot_name_err');
    addEventEle = document.getElementById('add_event');
    saveEventEle = document.getElementById('create_event');
    saveEventErr = document.getElementById('create_event_err');

    // Prefill/reset the data for create event
    addEventEle.addEventListener('click', function() {
        document.getElementById('event_name').value = '';
        document.getElementById('event_type').value = '';
        document.getElementById('x').innerText = '--';
        document.getElementById('y').innerText = '--';
        document.getElementById('sleep').value = '0.1';
        document.getElementById('typewrite_text').value = '';
        coordinate = [];
        
        saveEventEle.style.display = "block";
        addEventEle.style.display = "none";
        
        document.querySelector('.pos').style.display = 'flex';
        document.querySelector('.typewrite').style.display = 'none';
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
                document.querySelector('.bg-modal').style.display = "none";
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

// document.getElementById('typewrite_text')
// Change Event type
function changeEventType() {
    var eventType = document.getElementById('event_type').value;
    if(eventType == '' || eventType == 'click' || eventType == 'right_click' || eventType == 'double_click' || eventType == 'triple_click') {
        document.querySelector('.pos').style.display = 'flex';
        document.querySelector('.typewrite').style.display = 'none';
    } else if(eventType == 'type_write') {
        document.querySelector('.pos').style.display = 'none';
        document.querySelector('.typewrite').style.display = 'flex';
    }
}

// Create new Event
function saveEvent() {
    var eventName = document.getElementById('event_name').value;
    var eventType = document.getElementById('event_type').value;
    var typewriteText = document.getElementById('typewrite_text').value;
    var sleepTime = document.getElementById('sleep').value;
    if(!(eventName && sleepTime && ((eventType != 'type_write' && coordinate && coordinate[0] && coordinate[1]) || (eventType == 'type_write' && typewriteText)))) {
        saveEventErr.innerText = 'All fields required';
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
        sleep: sleepTime,
    }
    eel.createEvent(event);
    addEventToDOM(event);
}

// Add newly created event to DOM
function addEventToDOM(event) {
    if(event.type == 'type_write') {
        var eventHTML = `
        <div class="card">
            <div>
                <p>Event Name: </p>
                ${event.name}
            </div>
            <div>
                <p>Event Type: </p>
                ${getDisplayNameOfEvent(event.type)}
            </div>
            <div>
                <p>Type-write Text: </p>
                ${getDisplayText(event.text)}
            </div>
            <div>
                <p>Sleep After Event: </p>
                ${event.sleep} Seconds
            </div>
        </div>`;
    } else {
        var eventHTML = `
        <div class="card">
            <div>
                <p>Event Name: </p>
                ${event.name}
            </div>
            <div>
                <p>Event Type: </p>
                ${getDisplayNameOfEvent(event.type)}
            </div>
            <div>
                <p>Event Position</p>
                <div class="coordinates">
                    X :&ensp;<span>${event.position[0]}</span>&emsp;
                    Y :&ensp;<span>${event.position[1]}</span>
                </div>
            </div>
            <div>
                <p>Sleep After Event: </p>
                ${event.sleep} Seconds
            </div>
        </div>`;
    }
    saveEventEle.style.display = "none";
    addEventEle.style.display = "block";
    document.getElementById('events').insertAdjacentHTML('beforebegin', eventHTML);
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
    } else if(name == 'hotkey') {
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
    saveEventEle.style.display = "none"
    addEventEle.style.display = "block";
}
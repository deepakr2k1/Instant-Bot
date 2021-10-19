let isBotRunning = false;
let allBots, allBotsEle, addBotEle, runConfigEle, itrEle, itrErr, delIdx;

document.addEventListener("DOMContentLoaded", function(event) {
    allBotsEle = document.querySelector('.all-bots');
    addBotEle = document.querySelector('.add_bot');
    runConfigEle = document.querySelector('.bg-modal');
    itrEle = document.getElementById('iterations');
    itrErr = document.getElementById('run_config_err');
    
    eel.getAllBots()(function(allBots) {
        update(allBots);
    })
})

// Update HTML
function update(_allBots) {
    document.getElementById('all_bots').innerHTML = 
    `<div class="add_bot card cursor" onclick="createEditBot()">
        <img src="../assets/add_black_24dp.svg"/>
    </div>`;
    
    allBots = _allBots;
    for(var i=0; i<_allBots.length; i++) {
        addBotToDOM(_allBots[i], i);
    }
}

function addBotToDOM(bot, idx) {
    var botHTML = `
    <div class="card">
        <div><p>Bot Name: </p> ${bot.name} </div>
        <div><p>Total Events: </p> ${bot.events.length} </div>
        <div><p>Total Time: </p> ${getBotTotalTime(bot)} sec </div>
        <div class="event_opt">
            <img class="icon" onclick="runConfig(${idx})" src="../assets/play_arrow_black_24dp.svg">
            <img class="icon" onclick="createEditBot(${idx})" src="../assets/edit_black_24dp.svg">
            <img class="icon" onclick="del(${idx})" src="../assets/delete_black_24dp.svg">
        </div>
    </div>`;    

    document.querySelector('.add_bot').insertAdjacentHTML('beforebegin', botHTML);
}

// Get total bot time for one iteration
function getBotTotalTime(bot) {
    var time = 0;
    for(var i=0; i<bot.events.length; i++) {
        time += parseFloat(bot.events[i].sleep);
    }
    return Math.round(time * 10) / 10;
}

var popupIdx = -1;
function runConfig(idx) {
    runConfigEle.style.display = "flex";
    popupIdx = idx;
    itrEle.value = 1;
    // Reset data
    itrErr.innerText = '';
    itrErr.style.display = "none";
    isBotRunning = false;
}

// Run the bot
function run() {
    var itr = itrEle.value;
    itr = parseInt(itr);
    itrErr.style.display = "none";
    if(!itr) {
        itrErr.innerText = 'Repeatition cannot be Empty';
        itrErr.style.display = "block";
        return;
    }
    if(itr < 1 || itr > 500) {
        itrErr.innerText = 'Repeatition must be between 1 to 500';
        itrErr.style.display = "block";
        return;
    }
    
    if(!isBotRunning) {
        isBotRunning = true;
        eel.runBot(allBots[popupIdx].events, itr)(function(err) {
            if(err) {
                itrErr.innerText = 'Something went wrong, BOT stopped!';
                itrErr.style.display = "block";
            } else {
                cancel();
            }
            isBotRunning = false;
        });
    }
}

// Cancel the Run
function cancel() {
    runConfigEle.style.display = "none";
}

// Create/edit bot
function createEditBot(idx) {
    if(typeof(idx) != 'undefined') {
        window.location.href = "create-edit-bot.html?edit=" + idx;
    } else {
        window.location.href = "create-edit-bot.html";
    }
}

// Delete 
function del(idx) {
    document.getElementById('del_modal').style.display = "flex";
    delIdx = idx;
}
function delBot() {
    eel.delBot(delIdx)(function(allBots) {
        update(allBots);
        document.getElementById('del_modal').style.display = "none";
    })
}
function cancelDelBot() {
    document.getElementById('del_modal').style.display = "none";
}
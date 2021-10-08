let isBotRunning = false;
let allBots, allBotsEle, runConfigEle, itrEle, itrErr;

document.addEventListener("DOMContentLoaded", function(event) {
    allBotsEle = document.querySelector('.all-bots');
    runConfigEle = document.querySelector('.bg-modal');
    itrEle = document.getElementById('iterations');
    itrErr = document.getElementById('run_config_err');
})

eel.getAllBots()(function(_allBots) {
    allBots = _allBots;
    for(var i=0; i<_allBots.length; i++) {
        if(_allBots[i].events.length > 0) {
            addBotToDOM(_allBots[i], i);
        }
    }
})

function addBotToDOM(bot, idx) {
    var botHTML = `
    <div class="card" onclick="runConfig(${idx})">
        <div><p>Bot Name: </p> ${bot.name} </div>
        <div><p>Total Events: </p> ${bot.events.length} </div>
        <div><p>Total Time: </p> ${getBotTotalTime(bot)} sec </div>
    </div>`;    

    allBotsEle.insertAdjacentHTML('beforeend', botHTML);
}

// Get total bot time for one iteration
function getBotTotalTime(bot) {
    var time = 0;
    for(var i=0; i<bot.events.length; i++) {
        time += parseFloat(bot.events[i].sleep);
    }
    return time;
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
        itrErr.innerText = 'Iteration cannot be Empty';
        itrErr.style.display = "block";
        return;
    }
    if(itr < 1 || itr > 500) {
        itrErr.innerText = 'Iteration must be between 1 to 500';
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
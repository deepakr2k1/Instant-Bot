import gevent.monkey
gevent.monkey.patch_all()
import eel
from jinja2.utils import consume
import pyautogui as pa
import pickle
import os
from pathlib import Path

root = Path(".");

eel.init('src')

all_bots = []
curr_bot = {"name": "", "events": []};

# Create New file with filename same as botname.pkl
@eel.expose
def createNewBot(botname):
    file_name = botname + '.pkl';
    full_path = root / "bots";
    if file_name not in os.listdir(full_path):
        curr_bot["name"] = botname;
        curr_bot["events"] = [];
        saveBot(curr_bot);
    else:
        return "Botname Already exists";

# Save bot
@eel.expose
def saveBot(bot):
    botname = bot["name"];
    file_name = botname + '.pkl';
    full_path = root / "bots" / file_name;
    with open(full_path, 'wb') as file:
        pickle.dump(bot, file);

# Edit Bot
@eel.expose
def editBot(idx):
    all_bots = getAllBots();
    if idx >= 0 and idx < len(all_bots):
        curr_bot["name"] = all_bots[idx]["name"];
        curr_bot["events"] = all_bots[idx]["events"];
        return curr_bot;

# Delete Bot
@eel.expose
def delBot(idx):
    all_bots = getAllBots();
    if idx >= 0 and idx < len(all_bots):
        file_name = all_bots[idx]["name"] + '.pkl';
        full_path = root / "bots" / file_name;
        if os.path.exists(full_path):
            os.remove(full_path);
            all_bots.pop(idx);
            return all_bots;

# Get cursor current position
@eel.expose
def getCurrPos():
    return pa.position();

# Get event data
@eel.expose
def getEventData(idx):
    if idx >= 0 and idx < len(curr_bot["events"]):
        return curr_bot["events"][idx];

# Create/Edit events
@eel.expose
def createEditEvent(event, idx):
    if(event):
        if(idx == -1):
            curr_bot["events"].append(event);
        elif(idx >= 0 and idx < len(curr_bot["events"])):
            curr_bot["events"][idx] = event;
        saveBot(curr_bot);
        return curr_bot["events"];

# Delete event
@eel.expose
def delEvent(idx):
    if idx >= 0 and idx < len(curr_bot["events"]):
        curr_bot["events"].pop(idx);
        saveBot(curr_bot);
        return curr_bot["events"];

# File Load & Run Bot

# load a bot via filename
@eel.expose
def load(fileName):
    with open(fileName, 'rb') as file:
        bot = pickle.load(file)
    return bot;

# Load all bots
@eel.expose
def getAllBots():
    all_bots = []
    full_path = root / "bots";
    for file in os.listdir(full_path):
        file_path = full_path / file;
        bot = load(file_path);
        all_bots.append(bot);
    return all_bots;

# Run a bot for given iterations
@eel.expose
def runBot(allEvents, iterations):
    # Sleep for 3 sec before starting script and minimise the current window
    pa.sleep(1);
    pa.hotkey('win', 'down');
    pa.sleep(2);

    for i in range(iterations):
        for event in allEvents:
            type = event['type'];
            pos = event['position'];
            text = event['text'];
            hotkeys = event['hotkeys'];
            sleep = float(event['sleep']);
            if type == 'click':
                pa.click(pos[0], pos[1]);
            elif type == 'right_click':
                pa.rightClick(pos[0], pos[1]);
            elif type == 'double_click':
                pa.doubleClick(pos[0], pos[1]);
            elif type == 'triple_click':
                pa.tripleClick(pos[0], pos[1]);
            elif type == 'type_write':
                pa.typewrite(text);
            elif type == 'hotkeys':
                key_string = '';
                if len(hotkeys) > 0:
                    key_string = key_string + hotkeys[0];
                if len(hotkeys) > 1:
                    key_string = key_string + hotkeys[1];
                if len(hotkeys) > 2:
                    key_string = key_string + hotkeys[2];
                pa.hotkey(key_string);
            pa.sleep(sleep);

# @eel.expose
# def rename(currentFileName, newFileName):
#     os.rename(currentFileName, newFileName);

eel.start('views/index.html', size=(750,500))
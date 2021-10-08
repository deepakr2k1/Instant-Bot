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

# Get cursor current position
@eel.expose
def getCurrPos():
    return pa.position();

# Create new event
@eel.expose
def createEvent(event):
    if(event):
        curr_bot["events"].append(event);
        saveBot(curr_bot);

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
    # Sleep for 3 sec before starting script
    pa.sleep(3);
    for i in range(iterations):
        for event in allEvents:
            type = event['type'];
            pos = event['position'];
            text = event['text'];
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
            # elif type == 'hotkey':
            #     pa.hotkey(sleep);
            pa.sleep(sleep);

# @eel.expose
# def rename(currentFileName, newFileName):
#     os.rename(currentFileName, newFileName);

eel.start('views/index.html', size=(750,500))
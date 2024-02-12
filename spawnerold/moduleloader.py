import os
import importlib
import threading

def load_modules():
    entries = os.scandir('modules')
    for entry in entries:
        if(entry.name.startswith("__")):
            continue
        if(entry.is_dir()):
            module = importlib.import_module("modules."+entry.name)
            thread = threading.Thread(target=module.init, args=())
            thread.start()
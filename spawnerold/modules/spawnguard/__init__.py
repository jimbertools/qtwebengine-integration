import socket
import time
from modules.spawnguard.config import spawnguards
import json

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

def init():
    global sock
    while(True):
        try:
            registerDomain()
        except Exception as error:
            print(error)
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                time.sleep(1)
                sock.connect(spawnguards[0])
                time.sleep(1)
                authenticate()
                time.sleep(1)
                registerDomain()
            except Exception as e:
                print(e)
                pass
        time.sleep(60)

def authenticate():
    print("AUthenticate")
    data = {
        "type": "authenticate",
        "key": "db43c477-52e9-40da-9aaf-7eb5ea3e4c26"
    }
    sock.send(json.dumps(data).encode('utf-8'))

def registerDomain():
    print("RegisterDomain")
    data = {
        "type": "registerDomain",
        "domain": "example.com"
    }
    sock.send(json.dumps(data).encode('utf-8'))

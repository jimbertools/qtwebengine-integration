#include "socketcommunication.h"
#include "jxwindowcontroller.h"
#include "jimberx264browser.h"


void closeWindow(int winId);
void focusWindow(int winId);
void blurWindow(int winId);
void clearFocus(int winId);
QPACommunication::QPACommunication(QObject *parent) : QObject(parent)
{
    _sendToAllClients = reinterpret_cast<SendToAllClientsPtr>(QGuiApplication::platformFunction("sendToAllClients")); // Set function for reuse to send a message to all clients in QPA

    setFunctionsCallbackPtr setFunctions = reinterpret_cast<setFunctionsCallbackPtr>(QGuiApplication::platformFunction("setAllFunctions"));
    qInfo() << "Setting up QPA function map (functions QPA->browser)";
    FunctionMap functionMap;
    functionMap.insert("onMessage", reinterpret_cast<QFunctionPointer>(&onWsMessage));
    functionMap.insert("onBinaryMessage", reinterpret_cast<QFunctionPointer>(&onBinaryWsMessage));
    functionMap.insert("createBrowser", reinterpret_cast<QFunctionPointer>(&createBrowser));
    functionMap.insert("closeWindow", reinterpret_cast<QFunctionPointer>(closeWindow));
    functionMap.insert("focusWindow", reinterpret_cast<QFunctionPointer>(focusWindow));
    functionMap.insert("blurWindow", reinterpret_cast<QFunctionPointer>(blurWindow));
    functionMap.insert("clearFocus", reinterpret_cast<QFunctionPointer>(clearFocus));
    
    setFunctions(functionMap);
}
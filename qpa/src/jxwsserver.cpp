#include "jxwsserver.h"
#include <fcntl.h> /* For O_RDWR */
#include <unistd.h>
#include <QApplication>
#include <QFile>
#include <QGuiApplication>
#include <QProcess>
#include <QThread>
#include <QTimer>
#include <QUrlQuery>
#include <QtCore/QDebug>
#include "QtWebSockets/qwebsocket.h"
#include "QtWebSockets/qwebsocketserver.h"
#include "audiostreaming/Encoder.h"
#include "jxintegration.h"
#include "jxlog.h"
#include "jxwindow.h"

#define QPA_PORT 9001
#define BROWSER_PORT 6662
#define AUDIO_PORT 6663

JxWsServer::JxWsServer()
    : QObject(Q_NULLPTR),
      _tcpServer(new QTcpServer()),
      _audioTcpServer(new QTcpServer()),
      m_pWebSocketServer(new QWebSocketServer(QStringLiteral("JimberX264Wsserver"),
                                              QWebSocketServer::NonSecureMode,
                                              this)) {
  qInfo() << " IN JXWS";
  if (m_pWebSocketServer->listen(QHostAddress::Any, QPA_PORT)) {
    JxLog() << "JxWsServer listening on port" << QPA_PORT;
    connect(m_pWebSocketServer, &QWebSocketServer::newConnection, this,
            &JxWsServer::onNewConnection);
    connect(m_pWebSocketServer, &QWebSocketServer::closed, this, &JxWsServer::closed);
  }

  if (_tcpServer->listen(QHostAddress::LocalHost, BROWSER_PORT)) {
    qInfo() << "Drawing hub tcpsock listening on port" << BROWSER_PORT;
    connect(_tcpServer, &QTcpServer::newConnection, this, &JxWsServer::onNewTcpConnection);
    //  connect(_tcpServer, &QTcpServer::closed, this, &glHub::closed);
  }

  if (_audioTcpServer->listen(QHostAddress::LocalHost, AUDIO_PORT)) {
    qInfo() << "Drawing audio tcpsock listening on port" << AUDIO_PORT;
    connect(_audioTcpServer, &QTcpServer::newConnection, this, &JxWsServer::onNewAudioConnection);
    //  connect(_tcpServer, &QTcpServer::closed, this, &glHub::closed);
  }
}

JxWsServer::~JxWsServer() {
  m_pWebSocketServer->close();
  // qDeleteAll(m_clients.keys().begin(), m_clients.keys().end()); segfaults?
}

void JxWsServer::onNewConnection() {
  // qInfo() << "[JxWsServer::onNewConnection]";
  QWebSocket* pSocket = m_pWebSocketServer->nextPendingConnection();
  QString userId = qgetenv("USER_ID");
  QUrlQuery query(pSocket->requestUrl());
  if (!userId.isEmpty()) {
    QString taintedUserID = pSocket->requestUrl().path().split("/")[2];
    if (taintedUserID != userId) {
      pSocket->sendTextMessage(QString("close;"));
      pSocket->close();
      qInfo() << "Wrong user connected";
      return;
    }
  }

  QNetworkRequest nreq = pSocket->request();
  QString userLang = QString(nreq.rawHeader(QByteArray("accept-language")));
  QString clientIp = QString(nreq.rawHeader(QByteArray("X-Real-IP")));
  if (clientIp.size() == 0) {
    // QHostAddress qhost = pSocket->peerAddress();
    // clientIp = qhost.toIPv4Address();
  }
  auto queryWinId = query.queryItemValue("winId");
  int winId = 1;
  if (queryWinId.isEmpty()) {
    winId = JxIntegration::instance()->createBrowser(true)(userLang, clientIp);
  } else {
    winId = queryWinId.toInt();
  }

  JxLog() << "Client connected";
  connect(pSocket, &QWebSocket::textMessageReceived, this, &JxWsServer::processTextMessage,
          Qt::QueuedConnection);
  connect(pSocket, &QWebSocket::binaryMessageReceived, this, &JxWsServer::processBinaryMessage,
          Qt::QueuedConnection);
  connect(pSocket, &QWebSocket::disconnected, this, &JxWsServer::socketDisconnected);

  auto window = new wondow(winId);
  m_clients.insert(pSocket, window);

  pSocket->sendTextMessage(QString("socketready;"));

  sendQueuedMessages(-1);
  sendQueuedMessages(winId);
}

void JxWsServer::processTextMessage(QString message) {
  QWebSocket* pClient = qobject_cast<QWebSocket*>(sender());
  auto window(m_clients.value(pClient));
  if (!window || !pClient) {
    return;
  }
  JxIntegration::instance()->onMessage(true)(message, window->winId);  // send message to browser
  emit textMessageReceived(sender(), message, window->winId);          // send message to qpa
}

void JxWsServer::processBinaryMessage(QByteArray message) {
  // sendBinaryMessageToBrowser(message);
  QWebSocket* pClient = qobject_cast<QWebSocket*>(sender());
  wondow* window = m_clients.value(pClient);
  if (!window || !pClient) {
    return;
  }
  JxIntegration::instance()->onBinaryMessage(true)(message,
                                                   window->winId);  // send message to browser
  emit binaryMessageReceived(sender(), message, window->winId);
}

void JxWsServer::socketDisconnected() {
  qInfo() << "[JxWsServer::socketDisconnected]";
  QWebSocket* pClient = qobject_cast<QWebSocket*>(sender());

  qInfo() << " A window was closed with this windid: " << m_clients.value(pClient)->winId;
  JxIntegration::instance()->closeWindow(false)(m_clients.value(pClient)->winId);
  delete m_clients.value(pClient);
  m_clients.remove(pClient);
  pClient->deleteLater();

  QTimer::singleShot(10000, this, &JxWsServer::checkForExit);
}

void JxWsServer::checkForExit() {
  if (m_clients.size() <= 0) {
    qInfo() << "have to exit!??";
    QGuiApplication::quit();
  } else {
    qInfo() << "I dont have to exit!";
  }
}

void JxWsServer::sendQueuedMessages(int winId) {
  if (m_clients.size() == 0) {
    return;
  }

  QStringListPtr messageList =
      m_queuedMessages.value(winId);  //@todo no winid makes this crash, check nullptr

  if (messageList == nullptr || messageList->isEmpty()) {
    return;
  }
  if (winId == -1) {
    for (int i = 0; i < messageList->size(); ++i) {
      sendToAllClients(messageList->value(i), -1);
    }
    return;
  }

  auto client = getClientByWindowId(winId);

  for (int i = 0; i < messageList->size(); ++i) {
    client->sendTextMessage(messageList->value(i));
  }

  QByteArrayVectorPtr binMessageList =
      m_queuedBinMessages.value(winId);  //@todo no winid makes this crash, check nullptr

  if (binMessageList == nullptr || binMessageList->isEmpty()) {
    return;
  }

  for (int i = 0; i < binMessageList->size(); ++i) {
    client->sendBinaryMessage(*binMessageList->at(i).get());
  }
}

void JxWsServer::sendToAllClients(const QString& message, int windowId) {
  if (m_clients.isEmpty()) {
    queueMessage(message, windowId);
    return;
  }

  if (windowId == -1) {
    for (auto client : m_clients.keys()) {
      client->sendTextMessage(message);
    }
    return;
  }

  if (!m_clients.key(getWindowInClientsById(windowId))) {
    queueMessage(message, windowId);
    return;
  }

  m_clients.key(getWindowInClientsById(windowId))->sendTextMessage(message);
}

void JxWsServer::queueMessage(const QString& message, int winId) {
  if (!m_queuedMessages.contains(winId)) {
    m_queuedMessages.insert(winId, QStringListPtr::create());
  }
  m_queuedMessages.value(winId)->append(message);
}

void JxWsServer::sendBinToAllClients(const QByteArray& message) {
  for (auto client : m_clients.keys()) {
    client->sendBinaryMessage(message);
  }
}
void JxWsServer::sendBinToFirstClient(const QByteArray& message) {
  if (m_clients.isEmpty()) {
    return;
  }
  m_clients.firstKey()->sendBinaryMessage(message);
}

void JxWsServer::sendToAllClients(const QStringList& message) {
  for (auto client : m_clients.keys()) {
    client->sendTextMessage(message.join(";"));
  }
}
void JxWsServer::disconnectAll() {
  for (auto client : m_clients.keys()) {
    client->close();
  }
}
void JxWsServer::onNewTcpConnection() {
  QTcpSocket* socket = _tcpServer->nextPendingConnection();
  qInfo() << "Browser connected to QPA";
  connect(socket, &QTcpSocket::readyRead, this, &JxWsServer::processTcpMessage);
  connect(socket, &QTcpSocket::disconnected, this, &JxWsServer::socketTcpDisconnected);

  _tcpClients << socket;
}

void JxWsServer::onNewAudioConnection() {
  QTcpSocket* socket = _audioTcpServer->nextPendingConnection();
  qInfo() << "Audio connected to QPA";
  connect(socket, &QTcpSocket::readyRead, this, &JxWsServer::processAudioMessage);
}

void JxWsServer::socketTcpDisconnected() {
  QTcpSocket* pClient = qobject_cast<QTcpSocket*>(sender());
  if (pClient) {
    _tcpClients.removeAll(pClient);
    pClient->deleteLater();
  }
}

static int incomingWindowId = -1;
static int incomingSize = 0;
void JxWsServer::processTcpMessage() {
  QTcpSocket* socket = static_cast<QTcpSocket*>(sender());
  while (socket->bytesAvailable()) {
    if (incomingSize == 0) {
      if (socket->bytesAvailable() < 8) {
        break;
      }

      int windowId;
      char* windowIdArr = reinterpret_cast<char*>(&windowId);
      socket->read(windowIdArr, sizeof(int));
      incomingWindowId = windowId;

      int size;
      char* sizeArr = reinterpret_cast<char*>(&size);
      socket->read(sizeArr, sizeof(int));
      incomingSize = size;
    }

    if (socket->bytesAvailable() < incomingSize) {
      break;
    }

    QByteArray tcpData = socket->read(incomingSize);
    incomingSize = 0;

    if (incomingWindowId == -1) {
      // qInfo() << "winId msg is -1" << tcpData;
      for (auto client : m_clients.keys())  // todo change for correct window id
      {
        client->sendBinaryMessage(tcpData);
      }
      continue;
    }

    wondow* window = getWindowInClientsById(incomingWindowId);
    if (window) {
      m_clients.key(window)->sendBinaryMessage(tcpData);
      incomingWindowId = -1;
      continue;
    }

    if (!m_queuedBinMessages.contains(incomingWindowId)) {
      m_queuedBinMessages.insert(incomingWindowId, QByteArrayVectorPtr::create());
    }
    m_queuedBinMessages.value(incomingWindowId)->append(QByteArrayPtr::create(tcpData));
    incomingWindowId = -1;
  }
}
bool isEmpty(char* data, size_t size) {
  for (size_t i = 0; i < size; i++) {
    if (data[i] != 0) {
      return false;
    }
  }
  return true;
}

void JxWsServer::windowReadyForAudio(int winId) {
  wondow* window(getWindowInClientsById(winId));
  window->canPlayAudio = true;
}

void JxWsServer::processAudioMessage() {
  QTcpSocket* socket = static_cast<QTcpSocket*>(sender());
  if (socket->bytesAvailable() < 1152 * 10)
    return;

  auto bytesAv = static_cast<size_t>(socket->bytesAvailable());
  QByteArray rawAudioData(bytesAv, 0);
  socket->read(rawAudioData.data(), bytesAv);

  bool empty = isEmpty(rawAudioData.data(), bytesAv);
  if (empty)
    return;

  wavify(rawAudioData, 1, 44100);
  // wavify(rawAudioData, 1, 22050);

  rawAudioData.insert(0, QString("audio").toUtf8());
  for (wondow* window : m_clients.values()) {
    if (window->canPlayAudio) {
      m_clients.key(window)->sendBinaryMessage(rawAudioData);
      return;
    }
  }
}

void JxWsServer::sendVideo(const QByteArray& message, int windowId) {
  // qInfo() << "Sending video to " << windowId;
  for (auto client : m_clients.keys()) {
    if (windowId != -1 && m_clients.value(client)->winId == windowId) {
      client->sendBinaryMessage(message);
    }
  }
}

int JxWsServer::countConnectedClients() {
  return m_clients.size();
}

wondow* JxWsServer::getWindowInClientsById(int winId) {
  for (wondow* window : m_clients.values()) {
    if (window->winId == winId) {
      return window;
    }
  }
  return nullptr;
}
QWebSocket* JxWsServer::getClientByWindowId(int winId) {
  auto window(getWindowInClientsById(winId));
  return m_clients.key(window);
}
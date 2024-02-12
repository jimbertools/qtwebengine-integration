#ifndef JIMBERX264WSSERVER
#define JIMBERX264WSSERVER

#include <QGuiApplication>
#include <QQueue>
#include <QTcpServer>
#include <QTcpSocket>
#include <QWebSocket>
#include <QtCore/QByteArray>
#include <QtCore/QList>
#include <QtCore/QObject>
#include <QtCore/QVector>

QT_FORWARD_DECLARE_CLASS(QWebSocketServer)
QT_FORWARD_DECLARE_CLASS(QWebSocket)

typedef QSharedPointer<QStringList> QStringListPtr;
typedef QSharedPointer<QByteArray> QByteArrayPtr;
typedef QSharedPointer<QVector<QByteArrayPtr>> QByteArrayVectorPtr;

struct wondow {
  // wondow() : winId(-1), canPlayAudio(false) {}
  wondow() : winId(0), canPlayAudio(false) {}
  wondow(int winId) : winId(winId), canPlayAudio(false) {}

  int winId;
  bool canPlayAudio;

  bool operator==(const wondow& other) const  // neccesary for qmap
  {
    return winId == other.winId;
  }
  // bool operator<(const wondow& other) const  // neccesary for qmap
  // {
  //   if (winId < other->winId) {
  //     return true;
  //   }
  //   return false;
  // }
};

class JxWsServer : public QObject {
  Q_OBJECT
 public:
  static JxWsServer& instance() {
    static JxWsServer instance;  // Guaranteed to be destroyed.
                                 // Instantiated on first use.
    return instance;
  }

  ~JxWsServer();
  void sendToAllClients(const QString& message, int windowId);

  void sendToAllClients(const QStringList& message);

  void disconnectAll();

  int countConnectedClients();
  void windowReadyForAudio(int winId);

 public slots:
  // void sendReply(void *sender, const QString &message);
  void sendBinToAllClients(const QByteArray& message);
  void sendBinToFirstClient(const QByteArray& message);
  void sendVideo(const QByteArray& message, int windowId);
 signals:
  void closed();
  void connected();
  void textMessageReceived(void* sender, QString message, WId winId);
  void binaryMessageReceived(void* sender, QByteArray message, WId winId);

 private slots:
  void onNewConnection();
  void processTextMessage(QString message);
  void processBinaryMessage(QByteArray message);
  void socketDisconnected();

  void processTcpMessage();
  void onNewTcpConnection();
  void socketTcpDisconnected();

  void processAudioMessage();
  void onNewAudioConnection();
  void checkForExit();

 private:
  JxWsServer();
  void sendQueuedMessages(int winId);
  void queueMessage(const QString& message, int winId);
  wondow* getWindowInClientsById(int winId);
  QWebSocket* getClientByWindowId(int winId);

  QTcpServer* _tcpServer;
  QTcpServer* _audioTcpServer;
  QList<QTcpSocket*> _tcpClients;

  QWebSocketServer* m_pWebSocketServer;
  QMap<QWebSocket*, wondow*> m_clients;
  QMap<int, QStringListPtr> m_queuedMessages;
  QMap<int, QByteArrayVectorPtr> m_queuedBinMessages;

  QWebSocket m_audioWebSocket;
  bool m_debug;
};
#endif
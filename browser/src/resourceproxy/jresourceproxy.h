#pragma once

#include <QNetworkAccessManager>
#include <QObject>
#include <QThread>
#include <QUrl>
#include <QtNetwork>
#include "httpServer/httpServer.h"

#include "jrequest.h"
class QNetworkAccessManager;
class QHttpServer;
class QWebEngineProfile;

class JResourceProxy : public QObject {
 private:
  JResourceProxy();
  static JResourceProxy proxy;
  HttpServer* m_httpServer;
  QString m_userId;
  QWebEngineProfile* m_profile;

 public:
  JRequest* sendRequest(const QUrl&);
  JResourceProxy(JResourceProxy const&) = delete;
  void operator=(JResourceProxy const&) = delete;

  static JResourceProxy& instance() {
    static JResourceProxy proxy;
    return proxy;
  }
};

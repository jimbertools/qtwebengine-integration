#pragma once

#include <QTimer>
#include <QtPromise>
#include "httpServer/httpData.h"
#include "httpServer/httpRequestHandler.h"
#include "httpServer/httpRequestRouter.h"

using QtPromise::QPromise;

class QNetworkAccessManager;
class QNetworkReply;
class QWebEngineProfile;
class JCookieJar;

class JRequestHandler : public HttpRequestHandler {
 private:
  HttpRequestRouter router;
  QNetworkAccessManager* m_networkAccessManager;
  QNetworkReply* m_reply;
  QString m_userId;

  QWebEngineProfile* m_profile;
  JCookieJar* m_cookieJar;

 public:
  JRequestHandler();

  HttpPromise handle(HttpDataPtr data);
  HttpPromise handleResource(HttpDataPtr data);
  HttpPromise handleFileUpload(HttpDataPtr data);
  HttpPromise handleFileUploadDragnDrop(HttpDataPtr data);
};

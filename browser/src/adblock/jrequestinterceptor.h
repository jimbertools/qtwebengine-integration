#pragma once

#include <QWebEngineUrlRequestInterceptor>
#include <QtCore/QDebug>

class QNetworkAccessManager;
class JimberX264WebPage;
class Adblocker;

class JRequestInterceptor : public QWebEngineUrlRequestInterceptor {
 public:
  JRequestInterceptor(Adblocker* blocker, QString clientIp);
  ~JRequestInterceptor(){};
  void interceptRequest(QWebEngineUrlRequestInfo& info) override;

 private:
  Adblocker* m_adBlocker;
  QString m_clientIp;
};
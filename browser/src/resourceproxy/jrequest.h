#pragma once

#include <QNetworkAccessManager>
#include <QObject>
#include <QThread>
#include <QUrl>
#include <QtNetwork>

class QNetworkAccessManager;

class JRequest : public QObject {
  Q_OBJECT
 public:
  JRequest(QNetworkAccessManager* mgr, QUrl url, QString userId);
  ~JRequest();
  void get();
  QNetworkReply* getReply();
  bool isReady() { return m_ready; }
  QString getResponseContentTypeHeader() { return m_responseContentTypeHeader; }
  QByteArray getBytes() { return m_bytes; };
  void replaceAllURLs(QString& stylesheet);
  void replaceFontFamily(QString& stylesheet);
  void replaceFontDisplayOptional(QString& stylesheet);
  void fixCSS(QString& stylesheet);

 signals:
  void finished();

 private:
  bool m_ready = false;
  QUrl m_url;
  QNetworkReply* m_reply;
  QNetworkAccessManager* m_networkAccessManager;
  QByteArray m_bytes;
  QString m_responseContentTypeHeader;
  QString m_userId;

 private slots:
  void httpFinished();
  void error(const QNetworkReply::NetworkError& err);
  void downloadProgress(qint64 bytesReceived, qint64 bytesTotal);
};
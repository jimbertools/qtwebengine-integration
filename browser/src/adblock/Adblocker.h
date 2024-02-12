#pragma once
#include <QNetworkAccessManager>
#include <QtCore/QDebug>

class QNetworkAccessManager;
class JimberX264WebPage;

struct AdvertisementRequest {
  QString url;
  bool answered;
  bool accepted;
};

class Adblocker : public QObject {
 public:
  Adblocker(JimberX264WebPage* webPage);
  ~Adblocker() { qInfo() << "[Adblocker::~]"; };
  void setAdblockEnabled(bool enabled);
  bool isAdblockEnabled();
  void respond(bool accept);
  const QStringList& adDomains() { return m_adDomains; };
  bool shouldBlock(const QString domain);
  bool requestPermissionForAdvertisement(QString url);
  bool enabled() { return m_adblockEnabled; };

 private:
  QStringList m_adDomains;
  QNetworkAccessManager m_networkAccessManager;
  bool m_adblockEnabled;
  JimberX264WebPage* m_page;
  AdvertisementRequest m_advertisementRequest;
  bool m_temporaryAllowMainFrameAdLinks;

 private slots:
  void adblockListDownloaded();
};
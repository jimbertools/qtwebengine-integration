#include "Adblocker.h"
#include <QUrl>
#include <QWebEngineUrlRequestInterceptor>
#include <QtCore/QDebug>
#include <QtNetwork>
#include "../JCommandHandler.h"
#include "../jimberx264webpage.h"
#include "jrequestinterceptor.h"

Adblocker::Adblocker(JimberX264WebPage* webPage)
    : m_adblockEnabled(false), m_page(webPage), m_temporaryAllowMainFrameAdLinks(false) {
  //   m_networkAccessManager = new QNetworkAccessManager();
  auto req = QNetworkRequest(QUrl("https://jimber.io/adblock.txt"));
  QNetworkReply* reply = m_networkAccessManager.get(req);
  connect(reply, &QNetworkReply::finished, this, &Adblocker::adblockListDownloaded);
}

bool Adblocker::shouldBlock(const QString domain) {
  // qInfo() << "[Adblocker::shouldBlock]" << m_adDomains;
  if (!m_adblockEnabled) {
    return false;
  }
  if (m_adDomains.size() <= 0) {
    return false;
  }

  for (auto filter : m_adDomains) {  // example filter: adsense.google.com
    if (domain == filter) {
      return true;
    }
    if (domain.contains(QString(".").append(filter))) {
      return true;
    }
  }
  return false;
}

bool Adblocker::requestPermissionForAdvertisement(QString url) {
  if (m_temporaryAllowMainFrameAdLinks) {
    return true;
  }
  m_advertisementRequest = {
      url,
      false,
      false,
  };
  JCommand(OC::ADVERTISEMENTREQUEST, m_page->getParentId()) << m_advertisementRequest.url;

  while (!m_advertisementRequest.answered) {
    QCoreApplication::processEvents();
    QThread::sleep(0.1);
  }

  if (m_advertisementRequest.accepted) {
    m_temporaryAllowMainFrameAdLinks = true;
    QTimer::singleShot(1000, [&]() { m_temporaryAllowMainFrameAdLinks = false; });
    return true;
  } else {
    return false;
  }
}

void Adblocker::adblockListDownloaded() {
  QNetworkReply* reply = qobject_cast<QNetworkReply*>(sender());
  QVariant status_code = reply->attribute(QNetworkRequest::HttpStatusCodeAttribute);
  int status = status_code.toInt();
  if (status != 200) {
    qInfo() << "not 200!";
    return;
  }

  QByteArray data = reply->readAll();
  QList<QByteArray> dataList = data.split('\n');
  for (QByteArray bArr : dataList) {
    m_adDomains.append(bArr);
  }
  m_adDomains.removeLast();
}

void Adblocker::setAdblockEnabled(bool enabled) {
  m_adblockEnabled = enabled;
}

bool Adblocker::isAdblockEnabled() {
  return m_adblockEnabled;
}

void Adblocker::respond(bool accepted) {
  m_advertisementRequest.accepted = accepted;
  m_advertisementRequest.answered = true;
}
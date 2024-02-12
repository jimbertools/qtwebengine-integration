#include "jrequestinterceptor.h"
#include <QUrl>
#include <QtCore/QDebug>
#include <QtNetwork>
#include "../JCommandHandler.h"
#include "../jimberx264webpage.h"
#include "Adblocker.h"

JRequestInterceptor::JRequestInterceptor(Adblocker* blocker, QString clientIp)
    : m_clientIp(clientIp), m_adBlocker(blocker) {}

void JRequestInterceptor::interceptRequest(QWebEngineUrlRequestInfo& info) {
  if (true) {  // todo: is appisolating
    const QByteArray ip = m_clientIp.toUtf8();
    if (ip.size() > 1) {
      info.setHttpHeader("X-Real-IP", ip);
    }
  }

  if (!m_adBlocker->enabled()) {
    return;
  }
  // We only want to check resourses such as img, css, png, js. Not the actual browses to a page.
  // Those are handled in JimberX264WebPage::acceptNavigationRequest
  if (info.resourceType() == QWebEngineUrlRequestInfo::ResourceTypeMainFrame) {
    return;
  }

  const QUrl requestUrl = info.requestUrl();
  const QString domain = requestUrl.host().toLower();
  bool shouldBlock = m_adBlocker->shouldBlock(domain);

  if (shouldBlock) {
    info.block(true);
  }

  // for (auto filter : m_adDomains) {  // example filter: adsense.google.com
  //   if (domain.contains(filter)) {
  //     if (info.resourceType() != QWebEngineUrlRequestInfo::ResourceTypeMainFrame) {
  //       info.block(true);
  //       return;
  //     }
  //     if (m_temporaryAllowMainFrameAdLinks) {
  //       return;
  //     }

  //     m_advertisementRequest = {
  //         requestUrl.toString(),
  //         filter,
  //         false,
  //         false,
  //     };
  //     JCommand(OC::ADVERTISEMENTREQUEST, m_page->getParentId())
  //         << m_advertisementRequest.url << m_advertisementRequest.filter;

  //     while (!m_advertisementRequest.answered) {
  //       QCoreApplication::processEvents();
  //       QThread::sleep(0.1);
  //     }

  //     if (m_advertisementRequest.accepted) {
  //       m_temporaryAllowMainFrameAdLinks = true;
  //       QTimer::singleShot(1000, [&]() { m_temporaryAllowMainFrameAdLinks = false; });
  //     } else {
  //       // info.block(true);
  //       // QTimer::singleShot(2000, [&]() {
  //       qInfo() << "going back!" << m_page->url();
  //       info.redirect(m_page->url());
  //       // m_page->triggerAction(QWebEnginePage::Back, false);
  //       // });
  //     }
  //     return;
  //   }
  // }
}
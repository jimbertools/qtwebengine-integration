#include <QAuthenticator>
#include <QBuffer>
#include <QCoreApplication>
#include <QDir>
#include <QHostInfo>
#include <QThread>
#include <QWebEngineCertificateError>
#include <QWebEngineFindTextResult>
#include <QWebEngineProfile>
#include <QWebEngineScript>
#include <functional>
#include "JCommandHandler.h"
#include "adblock/jrequestinterceptor.h"
#include "jimberx264browser.h"
#include "jpopupwindow.h"
#include "jxwindowcontroller.h"
#include "passwordmanager/jpasswordmanager.h"
#include "uploadmanager/juploadmanager.h"

// This must be last for unkown reasons...
#include "jimberx264webpage.h"

typedef OutgoingCommand OC;

JimberX264WebPage::JimberX264WebPage(QWebEngineProfile* profile, QWidget* parent, QString clientIp)
    : QWebEnginePage(profile, parent),
      m_confirmClicked(false),
      m_confirmValue(false),
      m_adblocker(this),
      m_requestInterceptor(new JRequestInterceptor(&m_adblocker, clientIp)) {
  using std::placeholders::_1;
  QWebEnginePage::setWindowId(getParentId());
  // std::function<void(std::unique_ptr<QWebEngineNotification> notification)> onNotification =
  // std::bind(&JimberX264WebPage::onNotification, this, _1);
  // profile->setNotificationPresenter(onNotification);

  JimberPasswordManager& instance = JimberPasswordManager::instance();
  connect(&instance, &JimberPasswordManager::newCredentialsAvailable, this,
          &JimberX264WebPage::checkForAutoFill);
  connect(this, &JimberX264WebPage::loadFinished, this,
          &JimberX264WebPage::checkForAutoFill);  // hackyWhacky
  connect(this, &JimberX264WebPage::urlChanged, this,
          &JimberX264WebPage::checkForAutoFill);  // hackyWhacky
  connect(this, &JimberX264WebPage::titleChanged, this,
          &JimberX264WebPage::checkForAutoFill);  // hackyWhacky
  connect(this, &QWebEnginePage::authenticationRequired, this,
          &JimberX264WebPage::authenticationRequired);
  connect(this, &QWebEnginePage::findTextFinished, this, &JimberX264WebPage::findTextFinished);

  // Easier for development and debugging
  int index = QApplication::instance()->arguments().indexOf("--isolation");
  if (index > -1) {
    m_isolationDomains =
        QApplication::instance()->arguments().value(index + 1).split(QLatin1Char(';'));
    m_isAppIsolating = true;

    index = QApplication::instance()->arguments().indexOf("--protocols");
    if (index > -1) {
      m_isolationProtocols =
          QApplication::instance()->arguments().value(index + 1).split(QLatin1Char(';'));
      m_isolationProtocols.append("file");
    }
  }

  if (!QString(qgetenv("APP_ISOLATION_DOMAINS")).isEmpty()) {
    // Don't check if valid because there might be a typo in which case users could use it as a real
    // browser which might have dangerous side effects.
    // TL;DR; we want stuff to break if there is a misconfiguration
    m_isolationDomains = QString(qgetenv("APP_ISOLATION_DOMAINS")).split(QLatin1Char(';'));
    m_isolationProtocols = QString(qgetenv("APP_ISOLATION_PROTOCOLS")).split(QLatin1Char(';'));
    m_isolationProtocols.append("file");
    m_isAppIsolating = true;
  }

  setUrlRequestInterceptor(m_requestInterceptor);
  if (QString(qgetenv("ADBLOCK_ENABLED")) == "true") {
    setAdblockEnabled(true);
  }
}

JimberX264WebPage::~JimberX264WebPage() {
  delete m_requestInterceptor;
};

bool JimberX264WebPage::isAppIsolating() {
  return this->m_isAppIsolating;
}

QStringList JimberX264WebPage::getIsolatedDomains() {
  return this->m_isolationDomains;
}

QStringList JimberX264WebPage::getIsolatedProtocols() {
  return this->m_isolationProtocols;
}

bool JimberX264WebPage::certificateError(const QWebEngineCertificateError& certificateError) {
  Q_UNUSED(certificateError);
  return false;
}

int JimberX264WebPage::getParentId() {
  return reinterpret_cast<JimberX264Browser*>(parent()->parent())->winId();
}

// void JimberX264WebPage::onNotification(
//     std::unique_ptr<QWebEngineNotification> notification)
// {
//   qInfo() << "notification!!!";
//   QImage image = notification->icon();
//   QByteArray byteArray;
//   QBuffer buffer(&byteArray);
//   image.save(&buffer, "PNG");
//   QString iconBase64 = QString::fromLatin1(byteArray.toBase64().data());
//   QString origin = notification->origin().toEncoded();
//   JCommand(OC::NOTIFICATION, getParentId())
//       << notification->title() << origin << notification->message()
//       << iconBase64;
// }

bool JimberX264WebPage::acceptNavigationRequest(const QUrl& url,
                                                QWebEnginePage::NavigationType type,
                                                bool isMainFrame) {
  if (url.toString().startsWith("file://")) {
    return false;
  }
  QString navigationHost = url.host().toLower();
  if (isMainFrame) {
    bool shouldAdblock = m_adblocker.shouldBlock(navigationHost);

    if (shouldAdblock) {
      bool granted = m_adblocker.requestPermissionForAdvertisement(navigationHost);

      if (!granted) {
        return false;
      }
    }
  }

  bool domainIsolated = false;
  QRegularExpression fbVersion_re("^/v(\\d+).(\\d+)/dialog/oauth*");
  QRegularExpression oauth_re("/oauth/v2*");
  QRegularExpression uasLogin_re("/uas/login*");
  QRegularExpression uasLogout_re("/uas/logout*");
  QRegularExpression accountsTLD_re("accounts.*.*");  // louche
  // qDebug() << accountsTLD_re.match(url.host()) << url.host();
  // QRegularExpression re("^/v(\\d+).(\\d+)/dialog/oauth*")
  // /v3.2/dialog/oauth/read/

  // qDebug() << oauth_re.match("/oauth/v2") << url.path();
  // qDebug() << url.host();
  // qDebug() << url.scheme();
  // qDebug() << url.path();
  if (isMainFrame && isAppIsolating()) {
    for (int i = 0; i < m_isolationDomains.size(); i++) {
      if (isMainFrame &&
          ((navigationHost == "www." + m_isolationDomains.at(i)) ||
           navigationHost == m_isolationDomains.at(i) ||
           (navigationHost == "www.facebook.com" &&
            (fbVersion_re.match(url.path()).hasMatch() || url.path() == "/login.php" ||
             url.path() == "/login/device-based/regular/login/")) ||
           (accountsTLD_re.match(navigationHost).hasMatch() ||
            accountsTLD_re.match("www." + navigationHost).hasMatch()) ||
           (navigationHost == "www.google.com" && (uasLogin_re.match(url.path()).hasMatch() ||
                                                   uasLogout_re.match(url.path()).hasMatch()) ||
            (navigationHost == "www.linkedin.com" &&
             (oauth_re.match(url.path()).hasMatch() ||
              url.path() == "/checkpoint/lg/login-submit" ||
              uasLogin_re.match(url.path()).hasMatch() ||
              uasLogout_re.match(url.path()).hasMatch()))))) {
        domainIsolated = true;
      }
    }
    if (!domainIsolated) {
      for (int i = 0; i < m_isolationProtocols.size(); i++) {
        if (isMainFrame && (url.scheme() == m_isolationProtocols.at(i))) {
          domainIsolated = true;
        }
      }
    }

    if (!domainIsolated) {
      JCommand(OC::LEAVEISOLATION, getParentId()) << url.toString();
      return false;
    }
  }

  QString domain = this->url().host();
  if (this->url().port() > 0) {
    domain.append(":");
    domain.append(QString::number(this->url().port()));
  }
  const QString script = this->createFormScriptFileFromFileName("getusernameandpassword.js");

  const int winId = getParentId();
  this->runJavaScript(
      script, QWebEngineScript::ApplicationWorld, [domain, winId](const QVariant& v) {
        JimberPasswordManager::instance().credentialsFormSubmitted(domain, v, winId);
      });
  this->runJavaScript(loadScript("fieldobserver.js"), QWebEngineScript::ApplicationWorld);
  return QWebEnginePage::acceptNavigationRequest(url, type, isMainFrame);
}

QWebEnginePage* JimberX264WebPage::createWindow(QWebEnginePage::WebWindowType type) {
  // can check if tab
  if (type == WebDialog) {
    auto popup = JPopupWindowPtr::create(this->profile(), this->getParentId());
    // popup->setAttribute(Qt::WA_DeleteOnClose);
    JxWindowController::instance().addPopupWindow(popup);
    popup->show();
    popup->activateWindow();
    popup->webview().setFocus();

    return popup->page();
  } else  // new tab
  {
    auto window = JTabWindowPtr::create();
    // window->setAttribute(Qt::WA_DeleteOnClose); this is does weird stuff
    JxWindowController::instance().addTabWindow(window);
    JCommand(OC::WINDOWOPENED, getParentId()) << window->winId();
    window->setFocus();
    window->show();
    window->raise();
    auto page = window->webview()->page();
    page->setWindowId(window->winId());

    return page;
  }
}

void JimberX264WebPage::triggerAction(WebAction action, bool b) {
  return QWebEnginePage::triggerAction(action, b);
}

UploadPtr JimberX264WebPage::getUpload() {
  return m_currentUpload;
}

QStringList JimberX264WebPage::chooseFiles(FileSelectionMode mode,
                                           const QStringList&,
                                           const QStringList& acceptedMimeTypes) {
  m_currentUpload = UploadPtr::create();
  JUploadManager::instance().addUpload(m_currentUpload);
  qInfo() << "[acceptedMimeTypes]" << acceptedMimeTypes << (int)mode;
  int winId = getParentId();
  bool multiple = (mode == QWebEnginePage::FileSelectOpenMultiple);
  bool directory = (mode == 2);

  JCommand(OC::FILEUPLOAD, winId) << m_currentUpload->getId().toString() << multiple
                                  << acceptedMimeTypes.join(", ") << false << directory;

  while (!m_currentUpload->isFinished() && !m_currentUpload->isCancelled()) {
    QCoreApplication::processEvents();
    QThread::sleep(0.1);
  }

  QStringList files;
  if (m_currentUpload->isCancelled()) {
    return files;
  }

  JCommand(OC::FILEUPLOADFINISHED, winId);
  files = m_currentUpload->getFiles();
  // qInfo() << "[JimberX264WebPage::chooseFiles]" << files;
  m_currentUpload = nullptr;  // this can't be the right way ?
  return files;
};

void JimberX264WebPage::javaScriptAlert(const QUrl&,  // securityOrigin
                                        const QString& msg) {
  JCommand(OC::ALERT, getParentId()) << msg.toUtf8().toBase64();
}

bool JimberX264WebPage::javaScriptConfirm(const QUrl&,  // securityOrigin
                                          const QString& msg) {
  JCommand(OC::CONFIRM, getParentId()) << msg.toUtf8().toBase64();

  while (!this->m_confirmClicked) {
    QCoreApplication::processEvents();
    QThread::sleep(0.1);
  }

  this->m_confirmClicked = false;
  return this->m_confirmValue;
}

void JimberX264WebPage::javaScriptConsoleMessage(
    QWebEnginePage::JavaScriptConsoleMessageLevel level,
    const QString& message,
    int lineNumber,
    const QString& sourceID) {
  // qInfo() << level << message << lineNumber << sourceID;
  if (message == "retriggerautofill") {
    checkForAutoFill();
  }
}

void JimberX264WebPage::confirmDialog(bool value) {
  this->m_confirmClicked = true;
  this->m_confirmValue = value;
}

void JimberX264WebPage::checkForAutoFill() {
  QString domain = url().host();
  if (url().port() > 0) {
    domain.append(":");
    domain.append(QString::number(url().port()));
  }

  if (!JimberPasswordManager::instance().domainHasCredentials(domain))
    return;

  if (!JimberPasswordManager::instance().areCredentialsCached(domain)) {
    JimberPasswordManager::instance().requestPasswordDecryption(domain, getParentId());
    return;
  }

  Credentials credentials = JimberPasswordManager::instance().getCredentialsForDomain(domain);
  // qInfo() << "checkforautofill!!!!" << url() << credentials.user << credentials.password;

  if (credentials.user.length() <= 0 && credentials.password.length() <= 0)
    return;

  QString script = this->createFormScriptFileFromFileName("fillusernameandorpassword.js");
  script.replace("$domain$",
                 domain);  // Check to make sure we aren't injecting credentials on the wrong site

  // Don't allow JS injection from users (e.g: username";alert() )
  script.replace("$username$", QUrl::toPercentEncoding(credentials.user));
  script.replace("$password$", QUrl::toPercentEncoding(credentials.password));

  this->runJavaScript(script, QWebEngineScript::ApplicationWorld, [](const QVariant& v) {});
}

QString JimberX264WebPage::createFormScriptFileFromFileName(const QString& fileName) {
  QString formScript = loadScript("detectformscript.js");
  QString script = loadScript(fileName);

  if (formScript == "" || script == "") {
    return "";
  }

  formScript.append(script);
  return formScript;
}

QString JimberX264WebPage::loadScript(const QString& fileName) {
  QString scriptPath(":/scripts/js/");
  scriptPath.append(fileName);
  QFile file(scriptPath);

  if (file.open(QIODevice::ReadOnly | QIODevice::Text)) {
    QString script = file.readAll();
    file.close();
    return script;
  }
  return "";
}
void JimberX264WebPage::authenticationRequired(const QUrl& requestUrl,
                                               QAuthenticator* authenticator) {
  JCommand(OC::AUTHENTICATIONREQUEST, getParentId()) << requestUrl.toString();
  while (!this->m_authenticationRequestCancelled && !this->m_readyForAuthentication) {
    QCoreApplication::processEvents();
    QThread::sleep(0.1);
  }
  if (this->m_authenticationRequestCancelled) {
    this->m_authenticationRequestCancelled = false;
    *authenticator = QAuthenticator();
    return;
  }
  authenticator->setUser(m_currentAuthCredentials.user);
  authenticator->setPassword(m_currentAuthCredentials.password);
  this->m_readyForAuthentication = false;
  this->m_currentAuthCredentials = Credentials();
}

void JimberX264WebPage::authenticate(const QString& user, const QString& password) {
  this->m_currentAuthCredentials = Credentials(user, password);
  this->m_readyForAuthentication = true;
}

void JimberX264WebPage::cancelAuthenticationRequest() {
  this->m_authenticationRequestCancelled = true;
}

void JimberX264WebPage::findTextFinished(const QWebEngineFindTextResult& result) {
  JCommand(OutgoingCommand::SEARCHMATCHES, getParentId())
      << result.activeMatch() << result.numberOfMatches();
}
void JimberX264WebPage::setAdblockEnabled(bool enabled) {
  m_adblocker.setAdblockEnabled(enabled);
  JCommand(OC::ADDBLOCKSTATECHANGE, getParentId())
      << (m_adblocker.isAdblockEnabled() ? "true" : "false");
}

void JimberX264WebPage::adblockResponse(bool accepted) {
  m_adblocker.respond(accepted);
}

// bool JimberX264WebPage::shouldBlockDueToAd(QString domain) {
//   QStringList adDomains = m_adblocker.adDomains();

// for (auto filter : m_adDomains) {  // example filter: adsense.google.com
//   if (domain.contains(filter)) {
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
// }
// }
// }
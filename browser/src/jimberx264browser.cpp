#include "jimberx264browser.h"
#include <QBuffer>
#include <QClipboard>
#include <QDir>
#include <QDrag>
#include <QFile>
#include <QIcon>
#include <QInputMethodQueryEvent>
#include <QJsonArray>
#include <QJsonDocument>
#include <QMimeData>
#include <QShortcut>
#include <QTimer>
#include <QWebEngineDownloadItem>
#include <QWebEngineHistory>
#include <QWebEngineProfile>
#include "JCommandHandler.h"
#include "jimberx264webpage.h"
#include "jimberx264webview.h"
#include "jnotificationhandler.h"
#include "jxfiledownload.h"
#include "jxwindowcontroller.h"
#include "passwordmanager/jpasswordmanager.h"
#include "resourceproxy/jresourceproxy.h"
#include "uploadmanager/juploadmanager.h"

#define ZOOM 1

bool JimberX264Browser::isMobile = 0;

JimberX264Browser::JimberX264Browser(QWidget* parent,
                                     DownloadManager* downloadManager,
                                     QWebEngineProfile* profile,
                                     QString clientIp)
    : QMainWindow(parent),
      first(true),
      m_downloadManager(downloadManager),
      m_webEngineView(profile, this, clientIp) {
  // QString my_argv_0 = QApplication::instance()->arguments.at(0);
  // QNetworkAccessManager* mgr = new QNetworkAccessManager(this);
  // mgr->get(QNetworkRequest(QUrl(QString("http://localhost:12345/index.html"))));

  setFocusPolicy(Qt::StrongFocus);
  setAttribute(Qt::WA_AcceptTouchEvents, true);
  setAttribute(Qt::WA_Hover);
  this->resize(800, 600);
  // m_webEngineView.page()
  // m_webEngineView.page()->profile()->setHttpAcceptLanguage(language);
  // this->setUserAgent(
  //     "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:88.0) Gecko/20100101 Firefox/88.0");
  // this->setUserAgent(
  //     "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko)
  //     Chrome/91.0.4472.114 " "Safari/537.36");

  m_webEngineView.settings()->setAttribute(QWebEngineSettings::WebGLEnabled, true);
  // m_webEngineView.settings()->setUnknownUrlSchemePolicy(
  //     QWebEngineSettings::AllowAllUnknownUrlSchemes);  // might need to be hardened.
  setCentralWidget(&m_webEngineView);
  // m_webEngineView.page()->profile()->clearHttpCache();
  m_webEngineView.resize(800, 600);
  // m_webEngineView.setFocus();
  // qsrand(time(0))
  // webEngineView->resize(1, 1);
  // this->webEngineView->load("chrome://gpu");
  //-vf unsharp=3:3:0.6:5:5:0.0
  // connect(wss, &JxWsServer::textMessageReceived, this, &JimberX264Browser::onMessage);

  connect(&m_webEngineView, &QWebEngineView::loadStarted, this, &JimberX264Browser::loadStarted);
  connect(&m_webEngineView, &QWebEngineView::loadProgress, this, &JimberX264Browser::loadProgress);
  connect(&m_webEngineView, &QWebEngineView::loadFinished, this, &JimberX264Browser::loadFinished);
  connect(&m_webEngineView, &QWebEngineView::urlChanged, this, &JimberX264Browser::urlChanged);
  connect(&m_webEngineView, &QWebEngineView::titleChanged, this, &JimberX264Browser::titleChanged);
  connect(&m_webEngineView, &QWebEngineView::selectionChanged, this,
          &JimberX264Browser::selectionChanged);
  connect(&m_webEngineView, &QWebEngineView::iconChanged, this, &JimberX264Browser::iconChanged);
  connect(&m_webEngineView, &QWebEngineView::iconChanged, this, &JimberX264Browser::iconChanged);

  QPACommunication& instance = QPACommunication::instance();
  connect(&instance, &QPACommunication::textMessageReceived, this, &JimberX264Browser::onMessage);
  connect(&instance, &QPACommunication::binaryMessageReceived, this,
          &JimberX264Browser::onBinaryMessage);

  connect(m_webEngineView.page(), &QWebEnginePage::pdfPrintingFinished, this,
          &JimberX264Browser::pdfPrintingFinished);
  connect(m_webEngineView.page(), &QWebEnginePage::featurePermissionRequested, this,
          &JimberX264Browser::featurePermissionRequested);

  // QString userAgent("Mozilla/5.0 (X11; Linux x86_64; rv:75.0) Gecko/20100101 Firefox/75.0");
  // setUserAgent(userAgent);

  connect(m_webEngineView.page(), &QWebEnginePage::windowCloseRequested, this, &QWidget::close);

  connect(m_webEngineView.page(), &QWebEnginePage::printRequested, this,
          &JimberX264Browser::sendPrintRequest);

  using std::placeholders::_1;
  std::function<void(std::unique_ptr<QWebEngineNotification> notification)> onNotification =
      std::bind(&JNotificationHandler::onNotification, &JNotificationHandler::instance(), _1);
  // std::function<void(std::unique_ptr<QWebEngineNotification> notification)> onNotification =
  // std::bind(&JNotificationHandler::onNotification, _1);
  // QWebEngineProfile::defaultProfile()->setNotificationPresenter(onNotification);
}

void JimberX264Browser::sendPrintRequest() {
  sendPdfForPrinting();
}

JimberX264Browser::~JimberX264Browser() {
  handleAuthenticationCancel();  // to cancel an ongoing basic auth request
  qInfo() << "[JimberX264Browser::~JimberX264Browser]";
}

QWebEngineView* JimberX264Browser::webview() {
  return &(this->m_webEngineView);
}

void JimberX264Browser::selectionChanged() {
  JCommand(OC::SELECTION, this->winId())
      << m_webEngineView.page()->selectedText().toUtf8().toBase64();
}

void JimberX264Browser::setUserAgent(const QString& userAgent) {
  m_webEngineView.page()->profile()->setHttpUserAgent(userAgent);
  // webEngineView->page()->profile()->setHttpUserAgent(QString("Mozilla/5.0 (Linux; Android 7.1.2;
  // Redmi5 Plus) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.90 Mobile
  // Safari/537.36"));
}

void JimberX264Browser::loadFinished(bool) {}

void JimberX264Browser::urlChanged(const QUrl& url) {
  this->checkForCredentials(url);
  auto historyItems = page()->history()->items();
  if (m_previousUrl.isEmpty()) {
    JCommand(OC::PUSHHISTORY, this->winId()) << url.toDisplayString();
  } else if (historyItems.size() == 1) {
    JCommand(OC::REPLACEHISTORY, this->winId()) << url.toDisplayString();
  } else if (historyItems.size() >= 2) {
    OC cType = (historyItems.at(historyItems.size() - 2).url() == m_previousUrl)
                   ? OC::PUSHHISTORY
                   : OC::REPLACEHISTORY;
    JCommand(cType, this->winId()) << url.toDisplayString();
  }

  m_previousUrl = url;
}

void JimberX264Browser::checkForCredentials(const QUrl& url) {
  auto page = m_webEngineView.page();

  QString domain = url.host();
  if (url.port() > 0) {
    domain.append(":");
    domain.append(QString::number(url.port()));
  }
  if (JimberPasswordManager::instance().domainHasCredentials(domain)) {
    if (JimberPasswordManager::instance().areCredentialsCached(domain))
      return;
    JimberPasswordManager::instance().requestPasswordDecryption(domain, this->winId());
  }
}

void JimberX264Browser::titleChanged(const QString& title) {
  JCommand(OC::TITLE, this->winId()) << title;
  // SocketCommunication::instance().sendToAllClients(OC::TITLE + ';' + title);
}

void JimberX264Browser::iconChanged(const QIcon& icon) {
  QImage image(icon.pixmap(20, 20).toImage());
  QByteArray byteArray;
  QBuffer buffer(&byteArray);
  image.save(&buffer, "PNG");
  QString iconBase64 = QString::fromLatin1(byteArray.toBase64().data());
  //  SocketCommunication::instance().sendToAllClients("i;" + iconBase64);
  JCommand(OC::ICON, this->winId()) << iconBase64;
}

void JimberX264Browser::reload() {
  m_webEngineView.page()->triggerAction(QWebEnginePage::Reload);
}

void JimberX264Browser::forward() {
  m_webEngineView.page()->triggerAction(QWebEnginePage::Forward);
}

void JimberX264Browser::load(const QUrl& url) {
  // previousSite = true;
  QUrl urlCopy = url;
  if (!url.toString().mid(0, 4).contains("http") && url.toString() != "about:blank") {
    urlCopy =
        QUrl(QString("http://") + url.toString());  // add http in front if url does not have it
  }
  // On refresh sometimes we had no view, this forces a red page and back to the first url. Force
  // reload of ffmpeg.
  // JxLog() << "Loading!" << (withHttp.toString()).toStdString();
  this->m_webEngineView.load(urlCopy);
}
void JimberX264Browser::back() {
  m_webEngineView.page()->triggerAction(QWebEnginePage::Back);
}

void JimberX264Browser::copyImage() {
  m_webEngineView.page()->triggerAction(QWebEnginePage::CopyImageToClipboard);
}

void JimberX264Browser::saveImage() {
  m_webEngineView.page()->triggerAction(QWebEnginePage::DownloadImageToDisk);
}

void JimberX264Browser::saveMedia() {
  m_webEngineView.page()->triggerAction(QWebEnginePage::DownloadMediaToDisk);
}

void JimberX264Browser::loadStarted() {
  JCommand(OC::PAGELOADINGSTARTED, this->winId());
}

bool JimberX264Browser::event(QEvent* event) {
  // qInfo() << event->type();
  // if (event->type() == QEvent::Close) return false;
  return QMainWindow::event(event);
}

void JimberX264Browser::loadProgress(int progress) {
  if (progress < 100) {
    return;
  }
  JCommand(OC::PAGELOADINGFINISHED, this->winId());
}

// void JimberX264Browser::load(const QUrl& url) {
//   // qInfo() << "[JimberX264Browser::load]";
//   previousSite = true;
//   QUrl withHttp = url;
//   if (!url.toString().mid(0, 4).contains("http") && url.toString() != "about:blank") {
//     withHttp =
//         QUrl(QString("http://") + url.toString());  // add http in front if url does not have it
//   }
//   // On refresh sometimes we had no view, this forces a red page and back to the first url. Force
//   // reload of ffmpeg.
//   // JxLog() << "Loading!" << (withHttp.toString()).toStdString();
//   this->m_webEngineView.load(withHttp);

//   // qInfo() << "[JimberX264Browser::load] done";
//   // this->webEngineView->load(QString("chrome://m_downloads"));
//   // this->webEngineView->load(QString("chrome://gpu"));

//   // webEngineView->page()->runJavaScript("var head =
//   document.getElementsByTagName('head')[0];var
//   // meta = document.createElement('meta');meta.setAttribute('charset',
//   // 'utf-8');head.appendChild(meta);alert('appended');");
// }

void JimberX264Browser::handleCopyEvent(JIncomingCommand&) {
  QGuiApplication::clipboard()->setText(m_webEngineView.page()->selectedText());
}

void JimberX264Browser::onMessage(QString message, WId winId) {
  if (winId != this->winId()) {
    return;
  }
  auto jxCommand = JIncomingCommand(message);

  // Februari 2021: Set this to change the 'main' focus
  // 22/07/2021: Then why did we comment it? it fucks up QGuiApplication::focusWindow()
  // this->activateWindow();

  switch (jxCommand.getCommand()) {
    case IncomingCommand::RESIZE:
      handleResize(jxCommand);
      break;
    case IncomingCommand::CHANGEZOOM:
      handleZoom(jxCommand);
      break;
    case IncomingCommand::PRINT:
      print();
      break;
    case IncomingCommand::REQUESTPDFFORPRINTING:
      sendPdfForPrinting();
      break;
    case IncomingCommand::CHANGEURL:
      load(QUrl(jxCommand.arg(1)));
      break;
    case IncomingCommand::FILEDOWNLOADPAUSE:
      m_downloadManager->downloadPause(jxCommand.arg(1).toInt());
      break;
    case IncomingCommand::FILEDOWNLOADRESUME:
      m_downloadManager->downloadResume(jxCommand.arg(1).toInt());
      break;
    case IncomingCommand::FILEDOWNLOADCANCEL:
      m_downloadManager->downloadCancel(jxCommand.arg(1).toInt());
      break;
    case IncomingCommand::INIT:
      handleInit(jxCommand);
      break;
    case IncomingCommand::RELOAD:
      reload();
      break;
    case IncomingCommand::BACK:
      back();
      break;
    case IncomingCommand::FORWARD:
      forward();
      break;
    case IncomingCommand::FILEUPLOADCANCEL:
      qInfo() << "FILEUPLOADCANCEL";
      JUploadManager::instance().getUploadById(QUuid(jxCommand.arg(1)))->cancel();
      // page()->getUpload()->cancel();
      break;
    case IncomingCommand::GRANTPERMISSION:
      grantPermission(jxCommand);
      break;
    case IncomingCommand::DENYPERMISSION:
      denyPermission(jxCommand);
      break;
    case IncomingCommand::MOUSEWHEELEVENT:
      handleMouseWheel(jxCommand);
      break;
    case IncomingCommand::COPYEVENT:
      handleCopyEvent(jxCommand);
      break;
    case IncomingCommand::WINDOWCLOSED:
      handleWindowCloseEvent();
      break;
    case IncomingCommand::COPYIMAGE:
      copyImage();
      break;
    case IncomingCommand::PAGESEARCH:
      handlePageSearch(jxCommand);
      break;
    case IncomingCommand::SAVECREDENTIALS:
      saveCredentials(jxCommand);
      break;
    case IncomingCommand::SAVEMASTERSALTANDHASH:
      saveMasterSaltAndHash(jxCommand);
      break;
    case IncomingCommand::PASSWORDDECRYPTIONRESPONSE:
      onPasswordDecryptionResponse(jxCommand);
      break;
    case IncomingCommand::RESETPASSWORDMANAGER:
      JimberPasswordManager::instance().reset();
      break;
    case IncomingCommand::CACHEMASTERKEY:
      onCacheMasterKey(jxCommand);
      break;
    case IncomingCommand::AUTHENTICATIONRESPONSE:
      handleAuthenticationResponse(jxCommand);
      break;
    case IncomingCommand::CANCELAUTHENTICATIONREQUEST:
      handleAuthenticationCancel();
      break;
    case IncomingCommand::SAVEIMAGE:
      saveImage();
      break;
    case IncomingCommand::SAVEMEDIA:
      saveMedia();
      break;
    case IncomingCommand::FOCUSEVENT:
      handleFocusEvent(jxCommand);
      break;
    case IncomingCommand::SELECTMENUOPTIONBYINDEX:
      page()->selectMenuOptionByIndex(jxCommand.arg(1).toInt());
      break;
    case IncomingCommand::SETADBLOCKENABLED:
      page()->setAdblockEnabled(jxCommand.arg(1) == "true" ? true : false);
      break;
    case IncomingCommand::ADVERTISEMENTRESPONSE:
      page()->adblockResponse(jxCommand.arg(1) == "true" ? true : false);
      break;
    default:
      // qDebug() << "Some unknown command" << message;
      break;
  }
}

void JimberX264Browser::onBinaryMessage(const QByteArray& message, WId winId) {
  if (winId != this->winId()) {
    return;
  }
  if (message.startsWith("f"))  // for fileupload
  {
    // is it possible to name a file /etc/passwd or ../../../etc/passwd?
    // passwd is not really a target, but some other stuff might be, maybe

    processUploadCommand(message);
  } else if (message.startsWith("d"))  // for draganddropfileupload
  {
    // As dragndrop was implemented, it was clear directory traversal was possible, but that's fixed
    // now :) processDnDUploadCommand(message);
  }
}

void JimberX264Browser::handleMouseWheel(const JCommand& command) {
  int deltaX = static_cast<int>(command.arg(5).toDouble());
  int deltaY = static_cast<int>(command.arg(6).toDouble());

  Qt::KeyboardModifiers modifiers = Qt::KeyboardModifiers(command.arg(7).toInt());

  if (modifiers.testFlag(Qt::ControlModifier)) {
    if (deltaY < 0) {  // zoom in
      this->webview()->setZoomFactor(this->webview()->zoomFactor() + 0.25);
    } else {  // zoom out
      this->webview()->setZoomFactor(this->webview()->zoomFactor() - 0.25);
    }
  }

  int counter = 0;

  if (deltaX > 20) {
    page()->incrementSwipeQueue();
    // qDebug() << page()->m_swipeCounter;  // counter

    if (page()->m_swipeCounter > 15) {
      JimberX264Browser::forward();
      page()->swipePage();
    }
  } else if (deltaX < -20) {
    page()->incrementSwipeQueue();
    // qDebug() << page()->m_swipeCounter;  // counter

    if (page()->m_swipeCounter > 15) {
      JimberX264Browser::back();
      page()->swipePage();
    }
  }
}

void JimberX264Browser::grantPermission(const JCommand& command) {
  m_webEngineView.page()->setFeaturePermission(QUrl(command.arg(1)),
                                               QWebEnginePage::Feature(command.arg(2).toInt()),
                                               QWebEnginePage::PermissionGrantedByUser);
}

void JimberX264Browser::denyPermission(const JCommand& command) {
  m_webEngineView.page()->setFeaturePermission(QUrl(command.arg(1)),
                                               QWebEnginePage::Feature(command.arg(2).toInt()),
                                               QWebEnginePage::PermissionDeniedByUser);
}

void JimberX264Browser::handleResize(JCommand command) {
  return;  // wait why? @Johnkarl
  int width = command.arg(1).toInt();
  int height = command.arg(2).toInt();
  this->m_webEngineView.resize(width, height);
  this->resize(width, height);
}

void JimberX264Browser::handleZoom(JCommand command) {
  float zoom = command.arg(1).toFloat();
  this->webview()->setZoomFactor(this->webview()->zoomFactor() + zoom);
}

void JimberX264Browser::processUploadCommand(const QByteArray& message) {
  int nameLength = message.at(1);
  QString name(message.mid(2, nameLength));
  QByteArray fileData = message.mid(2 + nameLength);
  page()->getUpload()->addFile(name, fileData);
}

// Keep temporary for documentation purposes

// void JimberX264Browser::dragAndDropUploadStarted(const JCommand &command)
// {
//     int amountOfFiles = command.arg(1).toInt();
//     int x = command.arg(2).toInt();
//     int y = command.arg(3).toInt();
//     Upload *upload(DragAndDropUploadManager::instance().newUpload());
//     upload->setAmountOfFiles(amountOfFiles);
//     upload->setPos(x, y);
// }

// void JimberX264Browser::processDnDUploadCommand(const QByteArray &message)
// {
//     return;
//     this->webview()->setFocus();
//     int nameLength = message.at(1);
//     QString name(message.mid(2, nameLength));
//     QByteArray fileData = message.mid(2 + nameLength);
//     Upload *upload(DragAndDropUploadManager::instance().getUpload());
//     upload->addFile(name, fileData);
//     if (!upload->isFinished())
//     {
//         qInfo() << "not finished";
//         return;
//     }
//     auto location = QPoint(upload->getX(), upload->getY());
//     QDrag *drag = new QDrag(qApp->focusWidget());
//     QMimeData *mimeData = new QMimeData();
//     mimeData->setUrls(upload->getUrls());
//     drag->setMimeData(mimeData);

//     QMouseEvent *eventPress = new QMouseEvent(
//         QEvent::MouseButtonPress,
//         location, location,
//         Qt::MouseButton::LeftButton, Qt::MouseButton::LeftButton,
//         Qt::KeyboardModifier::NoModifier);
//     QApplication::postEvent(qApp->focusWidget(), eventPress);

//     QMouseEvent *eventMove = new QMouseEvent(
//         QEvent::MouseMove,
//         location, location,
//         Qt::MouseButton::LeftButton, Qt::MouseButton::LeftButton,
//         Qt::KeyboardModifier::NoModifier);
//     QApplication::postEvent(qApp->focusWidget(), eventMove);

//     QMouseEvent *eventRelease = new QMouseEvent(
//         QEvent::MouseButtonRelease,
//         location, location,
//         Qt::MouseButton::NoButton, Qt::MouseButton::NoButton,
//         Qt::KeyboardModifier::NoModifier);
//     QApplication::postEvent(qApp->focusWidget(), eventRelease);

//     // Qt::DropAction dropAction = drag->exec(Qt::DropAction::CopyAction);
// }

void JimberX264Browser::handlePageSearch(const JCommand& command) {
  if (command.arg(2) == "true") {
    this->m_webEngineView.findText(command.arg(1), QWebEnginePage::FindBackward);
  } else {
    this->m_webEngineView.findText(command.arg(1));
  };

  // QObject::connect(
  //     this->m_webEngineView.page(), &QWebEnginePage::findTextFinished,
  //     [this](const QWebEngineFindTextResult& result) {  // if(result.numberOfMatches() != 0){
  //       JCommand(OutgoingCommand::SEARCHMATCHES, this->winId())
  //           << result.activeMatch() << result.numberOfMatches();
  //       // }
  //     });
}

void JimberX264Browser::print() {
  page()->printToPdf(QString("page.pdf"),
                     QPageLayout(QPageSize(QPageSize::A4), QPageLayout::Portrait, QMarginsF()));
}
void JimberX264Browser::sendPdfForPrinting() {
  page()->printToPdf(QString("pdfforprinting.pdf"),
                     QPageLayout(QPageSize(QPageSize::A4), QPageLayout::Portrait, QMarginsF()));
}

void JimberX264Browser::pdfPrintingFinished(const QString& filepath, bool success) {
  JxLog() << filepath;
  if (!success) {
    JxLog() << "Printing PDF failed";
    return;
  }

  QFile file(filepath);
  if (!file.open(QIODevice::ReadOnly))
    return;
  QByteArray blob = file.readAll();
  QString b64blob(blob.toBase64());
  if (file.fileName() == "pdfforprinting.pdf") {
    JCommand(OutgoingCommand::PDFFORPRINTING, this->winId()) << b64blob;
    return;
  }
  JCommand(OutgoingCommand::PDF, this->winId()) << b64blob;
}

void JimberX264Browser::featurePermissionRequested(const QUrl& securityOrigin,
                                                   QWebEnginePage::Feature feature) {
  JCommand(OC::REQUESTPERMISSION, this->winId()) << securityOrigin.toString() << feature;
}

void JimberX264Browser::handleInit(const JCommand& command) {
  this->webview()->setFocus();
  bool mobile = command.arg(1) == "true" ? true : false;
  QString initUrl = command.arg(2);

  JimberX264Browser::isMobile = mobile;

  if (mobile) {
    QString userAgent(
        "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/87.0.4280.66 Mobile Safari/537.36");
    setUserAgent(userAgent);
  } else {
    setUserAgent(
        QString("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/91.0.4472.114 Safari/537.36"));
  }

  // It's too buggy to use
  // if (!this->page()->url().isEmpty() && this->page()->isIsolating()) {
  //   JCommand(OC::CLOSEWINDOW, this->winId());
  //   return;
  // }

  qInfo() << "[JimberX264Browser::handleInit]";
  if (initUrl.size() > 0) {
    // qDebug() << initUrl << "beofre";
    // if(!initUrl.startsWith("www.")){
    //   initUrl = "www." + initUrl;
    // }
    QTimer::singleShot(1, [this, initUrl]() { this->load(QUrl(initUrl)); });
  }

  JimberPasswordManager::instance().sendMasterKeyToNewTab(this->winId());
}

void JimberX264Browser::handleWindowCloseEvent() {}

bool JimberX264Browser::isAppIsolating() {
  return this->page()->isAppIsolating();
}

void JimberX264Browser::handleAuthenticationResponse(const JCommand& command) {
  QString user = command.arg(2);
  QString password = command.arg(3);
  auto page = dynamic_cast<JimberX264WebPage*>(m_webEngineView.page());
  page->authenticate(user, password);
}
void JimberX264Browser::handleAuthenticationCancel() {
  auto page = dynamic_cast<JimberX264WebPage*>(m_webEngineView.page());
  page->cancelAuthenticationRequest();
}

DownloadManager downloadManager;
int createBrowser(QString language, QString clientIp) {
  static bool profileIsSetup = false;
  auto profile = QWebEngineProfile::defaultProfile();
  if (!profileIsSetup) {
    setupProfile(profile, downloadManager, language);
    profileIsSetup = true;
  }
  auto window = JTabWindowPtr::create(nullptr, &downloadManager, profile, clientIp);
  // window->setAttribute(Qt::WA_DeleteOnClose); breaks stuff
  window->activateWindow();
  window->show();
  window->raise();
  window->setFocus();
  JxWindowController::instance().addTabWindow(window);

  if (window->isAppIsolating()) {
    downloadManager.setIsAppIsolating();
  }

  return window->winId();
}

void setupProfile(QWebEngineProfile* profile,
                  const DownloadManager& manager,
                  const QString& language) {
  profile->setPersistentCookiesPolicy(
      QWebEngineProfile::PersistentCookiesPolicy::AllowPersistentCookies);

  auto settings = profile->settings();
  settings->setAttribute(QWebEngineSettings::ScrollAnimatorEnabled, true);

  if (profile->httpAcceptLanguage().isEmpty()) {
    if (language.isEmpty()) {
      profile->setHttpAcceptLanguage("en-US,en;q=0.9");
    } else {
      profile->setHttpAcceptLanguage(language);  // HTTP header injection?
    }
  }
  QObject::connect(profile, &QWebEngineProfile::downloadRequested, &manager,
                   &DownloadManager::downloadRequested);

  // if dev profile->clearHttpCache();
}

void JimberX264Browser::saveCredentials(const JCommand& command) {
  const QString domain = command.arg(1);
  const QString username = command.arg(2);
  const QString password = command.arg(3);
  JimberPasswordManager::instance().saveCredentials(domain, username, password);
}

void JimberX264Browser::saveMasterSaltAndHash(const JCommand& command) {
  const QString salt = command.arg(1);
  const QString hash = command.arg(2);
  JimberPasswordManager::instance().saveMasterSaltAndHash(salt, hash);
}

void JimberX264Browser::onPasswordDecryptionResponse(const JCommand& command) {
  const QString domain = command.arg(1);
  const QString password = command.arg(2);
  JimberPasswordManager::instance().cachePlaintextPassword(
      domain, QUrl::fromPercentEncoding(password.toUtf8()));
}
void JimberX264Browser::onCacheMasterKey(const JCommand& command) {
  const QString masterKey = command.arg(1);
  JimberPasswordManager::instance().cacheMasterKey(masterKey);
}

void JimberX264Browser::handleFocusEvent(const JCommand& command) {
  const QString inOrOut = command.arg(1);
  if (inOrOut == "out") {
    webview()->clearFocus();
  }
  if (inOrOut == "in") {
    if (!webview()->hasFocus()) {
      activateWindow();
    }
  }

  //   qInfo() << "onMouseEnterEvent in";
  // QEvent event(QEvent::FocusIn);
  // QCoreApplication::instance()->sendEvent(QCoreApplication::instance(), &event);
  // QCoreApplication::instance()->processEvents();
  // qInfo() << QGuiApplication::focusWindow()->winId();
  // this->>setFocus();
  // qInfo() << QGuiApplication::focusWindow()->winId();
}
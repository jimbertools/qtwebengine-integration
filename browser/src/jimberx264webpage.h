#ifndef JIMBERX264WEBPAGE_H
#define JIMBERX264WEBPAGE_H
#include <QMainWindow>
#include <QWebEngineNotification>
#include <QWebEnginePage>
#include <memory>
#include "adblock/Adblocker.h"
#include "adblock/jrequestinterceptor.h"
#include "passwordmanager/credentials.h"
#include "uploadmanager/jupload.h"

QT_BEGIN_NAMESPACE

typedef QSharedPointer<Upload> UploadPtr;
class QWebEngineFindTextResult;
class JimberX264WebPage : public QWebEnginePage {
  Q_OBJECT

 public:
  JimberX264WebPage(QWebEngineProfile* profile = Q_NULLPTR, QWidget* parent = Q_NULLPTR, QString clientIp = "");
  virtual ~JimberX264WebPage();
  void confirmDialog(bool value);
  void onNotification(std::unique_ptr<QWebEngineNotification> notification);
  bool acceptNavigationRequest(const QUrl& url,
                               QWebEnginePage::NavigationType type,
                               bool isMainFrame) override;
  void triggerAction(WebAction action, bool b) override;
  QStringList chooseFiles(FileSelectionMode mode,
                          const QStringList& oldFiles,
                          const QStringList& acceptedMimeTypes) override;
  void javaScriptAlert(const QUrl& securityOrigin, const QString& msg) override;
  bool javaScriptConfirm(const QUrl& securityOrigin, const QString& msg) override;
  QWebEnginePage* createWindow(QWebEnginePage::WebWindowType type) override;
  int getParentId();
  UploadPtr getUpload();
  bool certificateError(const QWebEngineCertificateError& certificateError) override;
  void javaScriptConsoleMessage(QWebEnginePage::JavaScriptConsoleMessageLevel level,
                                const QString& message,
                                int lineNumber,
                                const QString& sourceID) override;
  QString createFormScriptFileFromFileName(const QString&);
  QString loadScript(const QString&);
  bool isAppIsolating();
  QStringList getIsolatedDomains();
  QStringList getIsolatedProtocols();
  void adblockResponse(bool accept);

  int m_swipeCounter = 0;  // prevents swiping multiple pages.
  void incrementSwipeQueue() { m_swipeCounter++; };
  void swipePage() { m_swipeCounter = 0; }

  void setAdblockEnabled(bool enabled);

 public slots:
  void checkForAutoFill();
  void authenticate(const QString& user, const QString& password);
  void cancelAuthenticationRequest();
  void findTextFinished(const QWebEngineFindTextResult& result);
  void authenticationRequired(const QUrl& requestUrl, QAuthenticator* authenticator);

 private:
  // bool shouldBlockDueToAd(QString domain);

  bool m_confirmClicked;
  bool m_confirmValue;
  UploadPtr m_currentUpload;
  bool m_readyForAuthentication = false;
  bool m_authenticationRequestCancelled = false;
  Credentials m_currentAuthCredentials;
  QStringList m_isolationDomains;
  QStringList m_isolationProtocols;
  bool m_isAppIsolating = false;
  Adblocker m_adblocker;
  JRequestInterceptor* m_requestInterceptor;
};

QT_END_NAMESPACE
#endif
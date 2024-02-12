#include <QApplication>
#include <QMap>
#include <QPrinter>
#include <QWebEngineCookieStore>
#include <QWebEngineSettings>
#include <QWebEngineView>

#include "jxfiledownload.h"
#include "socketcommunication.h"

#include <QMainWindow>
#include "JCommandHandler.h"
#include "jimberx264webview.h"

class JimberX264Browser : public QMainWindow {
 private:
  bool first;
  QUrl m_previousUrl;
  DownloadManager* m_downloadManager;
  JimberX264WebView m_webEngineView;
  QNetworkAccessManager manager;

  void load(const QUrl& url);
  void search(const QString& searchTerm);
  void handleResize(JCommand command);
  void handleZoom(JCommand command);
  void setUserAgent(const QString& userAgent);
  void grantPermission(const JCommand& command);
  void denyPermission(const JCommand& command);
  void handleMouseWheel(const JCommand& command);
  void handlePageSearch(const JCommand& command);
  void handleWindowCloseEvent();
  void handleAuthenticationResponse(const JCommand& command);
  void handleAuthenticationCancel();
  void handleFocusEvent(const JCommand& command);

  void reload();
  void forward();
  void back();
  void copyImage();
  void saveImage();
  void saveMedia();

  void processUploadCommand(const QByteArray& data);
  // void dragAndDropUploadStarted(const JCommand &command);
  // void processDnDUploadCommand(const QByteArray &message);

  void print();
  void sendPdfForPrinting();

  void checkForCredentials(const QUrl& url);
  void saveCredentials(const JCommand&);
  void saveMasterSaltAndHash(const JCommand&);
  void onPasswordDecryptionResponse(const JCommand&);
  void onCacheMasterKey(const JCommand&);

  JimberX264WebPage* page() { return reinterpret_cast<JimberX264WebPage*>(m_webEngineView.page()); }

 public:
  static bool isMobile;
  QWebEngineView* webview();
  JimberX264Browser(QWidget* parent = Q_NULLPTR,
                    DownloadManager* manager = Q_NULLPTR,
                    QWebEngineProfile* profile = Q_NULLPTR,
                    QString clientIp = "");
  ~JimberX264Browser() override;
  void handleCopyEvent(JIncomingCommand& command);
  void runJs(const QString& script) { m_webEngineView.page()->runJavaScript(script); }
  bool isAppIsolating();

 private slots:

 public slots:
  bool event(QEvent* event) override;
  void onMessage(QString message, WId winId);
  void onBinaryMessage(const QByteArray& message, WId winId);
  void urlChanged(const QUrl& url);
  void titleChanged(const QString& title);
  void iconChanged(const QIcon& icon);
  void selectionChanged();

  void loadFinished(bool ok);
  void loadStarted();
  void loadProgress(int progress);
  void pdfPrintingFinished(const QString& filePath, bool success);
  void featurePermissionRequested(const QUrl& securityOrigin, QWebEnginePage::Feature feature);
  void handleInit(const JCommand& command);
  void sendPrintRequest();
};

typedef QSharedPointer<JimberX264Browser> JTabWindowPtr;

int createBrowser(QString language, QString clientIp);
void setupProfile(QWebEngineProfile*, const DownloadManager&, const QString&);
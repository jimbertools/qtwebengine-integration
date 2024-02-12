#include <unistd.h>
#include <QApplication>
#include <QCoreApplication>
#include <QNetworkProxy>
#include <QUrl>
#include <QWebEngineProfile>
#include "jimberx264browser.h"
#include "jxwindowcontroller.h"
#include "resourceproxy/jresourceproxy.h"

// inline void setupProfile(QWebEngineProfile *profile, const DownloadManager &manager)
// {
//     QWebEngineProfile::defaultProfile()->setPersistentCookiesPolicy(
//         QWebEngineProfile::PersistentCookiesPolicy::AllowPersistentCookies);
//     if (QWebEngineProfile::defaultProfile()->httpAcceptLanguage().isEmpty())
//     {
//         QWebEngineProfile::defaultProfile()->setHttpAcceptLanguage("en-US,en;q=0.9");
//     }
//     QObject::connect(profile, &QWebEngineProfile::downloadRequested, &manager,
//     &DownloadManager::downloadRequested);
// }
void checkLicense() {
  char ciphertext[11];
  FILE* file = fopen("/tmp/license", "rb");
  if (!file) {
    std::cout << "License not found!" << std::endl;
    sleep(60);
    exit(0);
  }
  fgets(ciphertext, 11, file);

  int key[11] = {108, 111, 115, 105, 114, 101, 98, 109, 105, 106, 0};  //"losirebmij"
  std::string plaintext;

  for (int i = 0; i < 11; i++) {
    plaintext[i] = ciphertext[i] ^ key[i];
  }

  QDate licenseDate = QDate::fromString(QString(plaintext.c_str()), "dd/MM/yyyy");
  QDate currentDate = QDate::currentDate();

  qInfo() << "License valid for" << currentDate.daysTo(licenseDate) << "days";
  if (currentDate.daysTo(licenseDate) <= 0) {
    std::cout << "License has expired!" << std::endl;
    sleep(60);
    exit(0);
  }
}

int main(int argc, char** argv) {
  if (!qgetenv("USER_ID").isEmpty()) {
    checkLicense();
  }

  QCoreApplication::setAttribute(Qt::AA_EnableHighDpiScaling);
  QCoreApplication::setAttribute(Qt::AA_UseHighDpiPixmaps);
  QCoreApplication::setAttribute(Qt::AA_UseSoftwareOpenGL);

  QApplication app(argc, argv);
  app.setStyleSheet(
      "QToolTip { color: #000000; background-color: #ffffff; border-width: 1px; font-family: "
      "ubuntu, sans-serif; padding: 1px; font-weight:300; font-size:16px;}");

  // IamLoginInformation(parser.value(enableIamOption), parser.value(enableIamUser)); //@todo check
  // if user is provided otherwise error
  QWebEngineSettings::defaultSettings()->setAttribute(QWebEngineSettings::PluginsEnabled, true);
  QPACommunication::instance();  // init QPA QPACommunication &instance =

  // QNetworkAccessManager* mgr = new QNetworkAccessManager();
  JResourceProxy::instance();  // init
  // auto networkAccessManager = new QNetworkAccessManager();
  // auto reply = networkAccessManager->get(
  //     QNetworkRequest(QUrl(QString("http://localhost:12345/index.html"))));

  return QApplication::exec();
}
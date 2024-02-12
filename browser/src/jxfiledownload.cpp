#include "jxfiledownload.h"
#include <QFile>
#include <QHostInfo>
#include <QRandomGenerator>
#include <QWindow>
#include "JCommandHandler.h"

#pragma GCC diagnostic ignored "-Wdeprecated-declarations"

DownloadManager::DownloadManager() = default;

void DownloadManager::downloadRequested(QWebEngineDownloadItem* download) {
  connect(download, &QWebEngineDownloadItem::downloadProgress, this,
          &DownloadManager::downloadProgress);
  connect(download, &QWebEngineDownloadItem::finished, this, &DownloadManager::downloadFinished);
  connect(download, &QWebEngineDownloadItem::stateChanged, this,
          &DownloadManager::downloadStateChanged);

  JxLog() << "A download has been requested" << download->path() << -1;
  QString filename = download->downloadFileName();
  qInfo() << filename;
  QString rPath = getRandomPath();
  QString path = "/jimber_downloads/" + rPath + "/" + filename;  // PATH TRAVERSAL?
  download->setPath(path);
  m_downloads.push_back(download);
  JCommand(OutgoingCommand::FILEDOWNLOADCREATE, -1)
      << download->id() << filename.toUtf8().toBase64() << rPath;

  download->accept();
}

void DownloadManager::downloadCancel(int id) {
  m_downloads.at(id - 1)->cancel();
}

void DownloadManager::downloadPause(int id) {
  QWebEngineDownloadItem* download = m_downloads.at(id - 1);
  download->pause();
  if (download->isPaused()) {
    JCommand(OutgoingCommand::FILEDOWNLOADPAUSE, -1) << id << "paused";
  } else {
    qInfo() << "Could not pause the download";
  }
}

void DownloadManager::downloadResume(int id) {
  QWebEngineDownloadItem* download = m_downloads.at(id - 1);
  download->resume();
  if (!download->isPaused()) {
    JCommand(OutgoingCommand::FILEDOWNLOADDOWNLOADING, -1) << id;
  } else {
    qInfo() << "Could not resume the download";
  }
}

void DownloadManager::downloadStateChanged(QWebEngineDownloadItem::DownloadState state) {
  auto* download = reinterpret_cast<QWebEngineDownloadItem*>(sender());
  if (state == QWebEngineDownloadItem::DownloadInProgress) {
    JCommand(OutgoingCommand::FILEDOWNLOADDOWNLOADING, -1) << download->id();
  } else if (state == QWebEngineDownloadItem::DownloadCancelled) {
    JCommand(OutgoingCommand::FILEDOWNLOADCANCEL, -1) << download->id();
  } else if (state == QWebEngineDownloadItem::DownloadCompleted) {
    JCommand(OutgoingCommand::FILEDOWNLOADFINISH, -1) << download->id();
    if (m_isAppIsolating) {
      auto window = QGuiApplication::focusWindow();
      if (window) {
        int activeWindowId = window->winId();
        JCommand(OutgoingCommand::FILEDOWNLOADTRIGGERDOWNLOAD, activeWindowId) << download->id();
      }
    }
  }
}

void DownloadManager::downloadProgress(qint64 bytesReceived, qint64 bytesTotal) {
  JCommand(OutgoingCommand::FILEDOWNLOADPROGRESS, -1)
      << reinterpret_cast<QWebEngineDownloadItem*>(sender())->id() << bytesReceived << bytesTotal;
}

void DownloadManager::downloadFinished() {
  auto* download = reinterpret_cast<QWebEngineDownloadItem*>(sender());
  JxLog() << "[DownloadManager::downloadFinished]"
          << "There is a download m_finished with path: " << download->path() << download->state();
  return;
  // if (download->mimeType() == "application/pdf") {
  //     QFile file(download->path());
  //     if (!file.open(QIODevice::ReadOnly)) {
  //         return;
  //     }
  //     QByteArray blob = file.readAll();
  //     QString b64blob(blob.toBase64());
  //     JCommand(OutgoingCommand::PDF, -1) << b64blob;
  // }
}

void DownloadManager::setIsAppIsolating() {
  m_isAppIsolating = true;
}

QString DownloadManager::getRandomPath() {
  const QString possibleCharacters(
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789");
  const int randomStringLength = 24;  // assuming you want random strings of 24 characters

  QString randomString;
  for (int i = 0; i < randomStringLength; ++i) {
    int index = QRandomGenerator::global()->generate() % possibleCharacters.length();
    QChar nextChar = possibleCharacters.at(index);
    randomString.append(nextChar);
  }
  return randomString;
}

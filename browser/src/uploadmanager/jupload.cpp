#include "jupload.h"
#include <QDebug>
#include <QDir>
#include <QFile>
#include <QRandomGenerator>
#include <QUrl>
#include <QUuid>

bool Upload::isFinished() {
  return m_finished;
}

bool Upload::isCancelled() {
  return m_cancelled;
}

void Upload::finish() {
  m_finished = true;
}

void Upload::cancel() {
  qInfo() << "[Upload::cancel]";
  qInfo() << this;
  m_cancelled = true;
}

void Upload::addFile(const QString& name, const QByteArray& data) {
  auto fileNameParts(name.split("/"));
  fileNameParts.pop_front();
  QString path;
  bool isInDirectory = (fileNameParts.size() > 1);

  if (isInDirectory) {
    auto pathParts = name.split("/");
    pathParts.pop_back();
    path = pathParts.join("/");
    QDir().mkpath(m_uniquePath + path);
  }
  QString fileName(fileNameParts.join("/"));
  if (fileName.at(0) != "/") {
    fileName.prepend("/");
  }
  fileName.prepend(m_uniquePath);

  QDir dir(fileName);
  QString absolutePath(dir.absolutePath());
  if (absolutePath.mid(0, m_uniquePath.length()) != m_uniquePath) {
    qInfo() << "STRANGER DANGER!";
    return;
  }


  QFile file(fileName);
  if (!file.open(QIODevice::WriteOnly)) {
    qInfo() << "Could not open file, perhaps /tmp/uploads doesn't exist.";
    return;
  }

  file.write(data);
  file.close();
}

QStringList Upload::getFiles() {
  QStringList files;
  QDir directory(m_uniquePath);

  QStringList directoryFiles = directory.entryList(QDir::Dirs | QDir::Files | QDir::NoDotAndDotDot);

  foreach (QString file, directoryFiles) {
    QString tmp(m_uniquePath);
    tmp.append("/");
    tmp.append(file);
    files.append(tmp);
  }
  return files;
}

QList<QUrl> Upload::getUrls() {
  QList<QUrl> urls;
  QDir directory(m_uniquePath);

  QStringList files = directory.entryList(QDir::Dirs | QDir::Files | QDir::NoDotAndDotDot);

  foreach (QString file, files) {
    QString tmp("file://");
    tmp.append(m_uniquePath);
    tmp.append("/");
    tmp.append(file);
    urls.append(QUrl(tmp));
  }
  return urls;
}

Upload::Upload() : m_finished(false), m_cancelled(false), m_id(QUuid::createUuid()) {
  m_uniquePath = "/tmp/uploads/" + getRandomPath();
  QDir().mkdir(m_uniquePath);
}
Upload::Upload(QUuid id) : m_finished(false), m_cancelled(false), m_id(id) {
  m_uniquePath = "/tmp/uploads/" + getRandomPath();
  QDir().mkdir(m_uniquePath);
}

Upload::~Upload() = default;

QString Upload::getRandomPath() {
  const QString possibleCharacters(
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789");
  const int randomStringLength = 12;  // assuming you want random strings of 12 characters

  QString randomString;
  for (int i = 0; i < randomStringLength; ++i) {
    int index = QRandomGenerator::global()->generate() % possibleCharacters.length();
    QChar nextChar = possibleCharacters.at(index);
    randomString.append(nextChar);
  }
  return randomString;
}

QString Upload::getUniquePath() {
  return m_uniquePath;
}

void Upload::setPos(int x, int y) {
  this->x = x;
  this->y = y;
}

int Upload::getX() {
  return x;
}

int Upload::getY() {
  return y;
}

const QUuid& Upload::getId() const {
  return m_id;
}

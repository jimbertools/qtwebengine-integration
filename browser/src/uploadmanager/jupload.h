#pragma once

#include <QString>
#include <QStringList>
#include <QUuid>

class QUrl;
class Upload {
 private:
  bool m_finished;
  bool m_cancelled;
  QStringList m_files;
  QString m_uniquePath;
  QString getRandomPath();
  int m_amountOfFiles = 0;

  // only used for draganddrop
  int x;
  int y;

  QUuid m_id;

 public:
  Upload();
  Upload(QUuid id);
  bool isFinished();
  bool isCancelled();
  QStringList getFiles();
  QList<QUrl> getUrls();
  void addFile(const QString& f, const QByteArray&);
  QString getUniquePath();
  void finish();
  void cancel();
  int getX();
  int getY();
  const QUuid& getId() const;

  void setAmountOfFiles(int amount) { m_amountOfFiles = amount; };
  ~Upload();
  void setPos(int x, int y);

  private:
};

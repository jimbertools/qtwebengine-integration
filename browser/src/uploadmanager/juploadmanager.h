
#include <QtCore/qobject.h>
#include <QMap>
#include <QSharedPointer>
#include <QUuid>
#include "jupload.h"

// class Upload;
// class QUuid;

class JUploadManager : public QObject {
  Q_OBJECT
 public:
  static JUploadManager& instance() {
    static JUploadManager instance;  // Guaranteed to be destroyed.
    return instance;
  }

  void addUpload(QSharedPointer<Upload> upload);
  QSharedPointer<Upload> getUploadById(const QUuid& id) const;

 signals:

 private:
  QMap<QUuid, QSharedPointer<Upload>> m_uploads;
};
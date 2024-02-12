#include "juploadmanager.h"
#include <QDebug>
#include <QSharedPointer>
#include "jupload.h"

QSharedPointer<Upload> JUploadManager::getUploadById(const QUuid& id) const {
  return m_uploads.value(id);
}

void JUploadManager::addUpload(QSharedPointer<Upload> upload) {
  m_uploads.insert(upload->getId(), upload);
}
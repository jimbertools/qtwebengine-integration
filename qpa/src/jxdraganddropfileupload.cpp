#include "jxdraganddropfileupload.h"
#include "jupload.h"
#include <QDebug>
#include <QFile>
#include <QDir>

Upload *DragAndDropUploadManager::newUpload()
{
    if(m_upload) {
        delete m_upload;
    }
    m_upload = new Upload();
    return m_upload;
}

Upload *DragAndDropUploadManager::getUpload()
{
    return m_upload;
}

void DragAndDropUploadManager::cancelUpload()
{
    return m_upload->cancel();
}

void DragAndDropUploadManager::clearUpload()
{
    delete m_upload;
}
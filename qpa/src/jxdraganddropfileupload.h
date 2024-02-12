#include <QSharedPointer>
#include <QString>
#include <QStringList>
#include "jupload.h"

class DragAndDropUploadManager {
 public:
  static DragAndDropUploadManager& instance() {
    static DragAndDropUploadManager instance;  // Guaranteed to be destroyed.
                                               // Instantiated on first use.
    return instance;
  }
  Upload* newUpload();
  void cancelUpload();
  void clearUpload();
  Upload* getUpload();

 private:
  DragAndDropUploadManager() = default;
  Upload* m_upload{};

 protected:
  // UploadManager();                                 // Prevent construction
  // UploadManager(const UploadManager &);            // Prevent construction by copying
  DragAndDropUploadManager& operator=(
      const DragAndDropUploadManager&);  // Prevent assignment
                                         //~UploadManager(){}; // Prevent unwanted destruction
};
QT_END_NAMESPACE
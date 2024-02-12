#ifndef JIMBERX264WINDOW_H
#define JIMBERX264WINDOW_H

#include <QDebug>
#include <QString>

#include <QtGui/qpa/qplatformwindow.h>
#include <QtGui/qpa/qplatformwindow_p.h>
#include <QtGui/qpa/qwindowsysteminterface.h>

#include "JCommandHandler.h"
#include "jxintegration.h"
#include "jxwsserver.h"
#include "mouseevent.h"
#include "videostreaming/closeeventfilter.h"

#define MODULENAME "QPA"

class Upload;

QT_BEGIN_NAMESPACE
class JxWindow : public QObject, public QPlatformWindow {
  Q_OBJECT
 public:
  bool clientIsUsingSafari;
  static int _wincount;
  JxWindow(QWindow* window, QTouchDevice* touchdevice);
  ~JxWindow(){};
  WId winId() const override;
  void setGeometry(const QRect& rect) override;
  QRect _cleanGeometry = QRect(0, 0, 800, 600);

  QRect geometry() const override;
  void triggerKeyEvent(QEvent::Type event, int key, int modifiers, QString text);

 signals:
  void pause();
  void resume();

 public slots:
  void onMessage(void* pClient, QString message, WId winId);
  void onBinaryMessage(void* pClient, QByteArray message, WId winId);
  void fileUploadFinished(QUuid uploadId, QList<QUrl> fileList);
  // void setGeometry(const QRect &rect) {
  //   qInfo() << "setGeometry jxwindow";
  //   Q_D(QPlatformWindow);
  //   d->rect = rect;
  // };

 private:
  void handleKeyMessage(JIncomingCommand command);
  void handlePopupClosed(JIncomingCommand command);
  void handleClipboardUpdate(JIncomingCommand command);
  void handleMouseEvent(JIncomingCommand command);
  void handleMouseWheel(JIncomingCommand command);
  void handleFocusEvent(JIncomingCommand command);
  void handleResize(JIncomingCommand command);
  void handleTouchEvent(JIncomingCommand command);
  void handleQualityEvent(JIncomingCommand command);
  void handlePixelRatioEvent(JIncomingCommand command);
  void dragAndDropUploadStarted(JIncomingCommand command);
  void processDnDUploadCommand(const QByteArray& message);
  void dragOverEvent(JIncomingCommand command);
  void handlePauseVideoStreaming();
  void handleResumeVideoStreaming();
  void handlePing();
  void handleWindowClosed();
  void handleCloseWindowById(const JIncomingCommand& command);
  void requestActivateWindow();
  bool setKeyboardGrabEnabled(bool grab);
  bool setMouseGrabEnabled(bool grab);
  bool windowEvent(QEvent* event) override;
  int codeToKey(QString);
  void onKeyEvent(QEvent::Type type, int code, int modifiers, const QString& text);
  void onMousePressEvent(MouseEvent&);
  void onMouseReleaseEvent(MouseEvent&);
  void onMouseMoveEvent(MouseEvent&);
  void onMouseEnterEvent(MouseEvent&);
  void onMouseLeaveEvent(MouseEvent&);
  void onMouseWheel(double layerX,
                    double layerY,
                    double clientX,
                    double clientY,
                    int deltaX,
                    int deltaY,
                    int modifiers);
  void raise() override;

  QWindow* window;
  QTouchDevice* _touchDevice;
  QString _leftMouseButton = "up";
  QRect _geometry = QRect(0, 0, 800, 600);
  QFile* m_webcam;
  QFile* m_mic;
  bool m_webcam_enabled = false;
  int _winId;
  CloseEventFilter _closeEventFilter;

  QMimeData* m_tmpMime;
  QSharedPointer<Upload> m_upload;
};

QT_END_NAMESPACE

#endif

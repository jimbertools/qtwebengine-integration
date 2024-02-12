
#ifndef QJIMBERINTEGRATION_H
#define QJIMBERINTEGRATION_H

#include <QtCore/qthread.h>
#include <QtGui/qpa/qplatformnativeinterface.h>
#include <qpa/qplatforminputcontext.h>
#include <qpa/qplatforminputcontextfactory_p.h>
#include <qpa/qplatformintegration.h>
#include <qpa/qwindowsysteminterface.h>
#include <QUuid>
#include "jxbackingstore.h"
#include "jxinputcontext.h"
#include "jxwsserver.h"

QT_BEGIN_NAMESPACE

typedef QMap<QString, QFunctionPointer> FunctionMap;

#define BrowserFunction(TYPE, NAME, ...)                                \
  TYPE (*NAME(bool checkNullPtr = false))(__VA_ARGS__) {                \
    if (m_functions[#NAME] == nullptr && checkNullPtr) {                \
      qInfo() << "No browserfunction" << #NAME << "found";              \
      return [](__VA_ARGS__) { return TYPE(); };                        \
    }                                                                   \
    return reinterpret_cast<TYPE (*)(__VA_ARGS__)>(m_functions[#NAME]); \
  }

class QAbstractEventDispatcher;
class QTouchDevice;
class JDrag;
class JxCursor;
class JxWindow;

class JxIntegration : public QPlatformNativeInterface, public QPlatformIntegration {
  Q_OBJECT
 public:
  explicit JxIntegration();
  virtual ~JxIntegration() override {
    QWindowSystemInterface::unregisterTouchDevice(_touchDevice);
  };

  static JxIntegration* instance();
  void initialize() override;
  QPlatformWindow* createPlatformWindow(QWindow* window) const;
  QPlatformBackingStore* createPlatformBackingStore(QWindow* window) const;
  QAbstractEventDispatcher* createEventDispatcher() const override;
  void sendToAllClients(const QString& message, int windowId);
  QPlatformClipboard* clipboard() const override;
  QPlatformNativeInterface* nativeInterface() const override;
  QPlatformFontDatabase* fontDatabase() const override;
  QPlatformServices* services() const override;
  QPlatformDrag* drag() const override;

  bool hasCapability(Capability cap) const {
    return cap == NonFullScreenWindows || cap == NativeWidgets || cap == WindowManagement;
  }
  QPlatformInputContext* inputContext() const;
  QFunctionPointer platformFunction(const QByteArray& function) const override;

  void browserFunctions(FunctionMap functions) { m_functions = functions; }

  BrowserFunction(void, onMessage, QString, int);
  BrowserFunction(void, onBinaryMessage, QByteArray, int);
  BrowserFunction(int, createBrowser, QString, QString);
  BrowserFunction(void, closeWindow, int);
  BrowserFunction(void, focusWindow, int);
  BrowserFunction(void, clearFocus, int);

 signals:
  void fileUploadReady(QUuid uploadId, QList<QUrl> files);

 private:
  FunctionMap m_functions;
  QTouchDevice* _touchDevice;
  // JxInputContext *_inputContext;
  QPlatformInputContext* _inputContext;

  QTcpServer* _skiaServer;
  JDrag* m_drag;
};

QT_END_NAMESPACE

#endif

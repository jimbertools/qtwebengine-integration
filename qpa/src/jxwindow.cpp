#include "jxwindow.h"
#include <private/qapplication_p.h>
#include <private/qguiapplication_p.h>
#include <private/qhighdpiscaling_p.h>
#include <private/qsimpledrag_p.h>
#include <qpa/qwindowsysteminterface.h>
#include <QDir>
#include <QDrag>
#include <QJsonArray>
#include <QJsonDocument>
#include <QJsonObject>
#include <QJsonValue>
#include <QMimeData>
#include "JCommandHandler.h"
#include "jupload.h"
#include "juploadmanager.h"
#include "jxclipboard.h"
#include "jxdraganddropfileupload.h"
#include "jxlog.h"
#include "keymap.h"
#include "touchobject.h"
#pragma GCC diagnostic ignored "-Wdeprecated-declarations"

typedef IncomingCommand IC;

int JxWindow::_wincount = 0;

JxWindow::JxWindow(QWindow* window, QTouchDevice* touchDevice)
    : QPlatformWindow(window),
      window(window),
      _touchDevice(touchDevice),
      _closeEventFilter(window) {
  _wincount++;
  _winId = _wincount;
  connect(&JxWsServer::instance(), &JxWsServer::textMessageReceived, this, &JxWindow::onMessage,
          Qt::QueuedConnection);
  connect(&JxWsServer::instance(), &JxWsServer::binaryMessageReceived, this,
          &JxWindow::onBinaryMessage, Qt::QueuedConnection);

  connect(JxIntegration::instance(), &JxIntegration::fileUploadReady, this,
          &JxWindow::fileUploadFinished);

  if (QString(qgetenv("WEBCAM_ENABLED")) == "1") {
    m_webcam_enabled = true;
  }
  m_tmpMime = new QMimeData();
  QList<QUrl> list;
  list.append(QUrl(QString("file:///tmp/dragndrop")));
  m_tmpMime->setUrls(list);

  window->installEventFilter(&_closeEventFilter);

  qInfo() << &JUploadManager::instance();
}

void JxWindow::requestActivateWindow() {
  JxIntegration::instance()->focusWindow(false)(this->winId());
  QPlatformWindow::requestActivateWindow();
  // QWindowSystemInterface::handleWindowActivated(this->window);
}

WId JxWindow::winId() const {
  // Return anything but 0. Returning 0 would cause havoc with QWidgets on
  // very basic platform plugins that do not reimplement this function,
  // because the top-level widget's internalWinId() would always be 0 which
  // would mean top-levels are never treated as native.
  return WId(_winId);
}

void JxWindow::onMessage(void* pClient, QString message, WId winId) {
  Q_UNUSED(pClient)
  if (winId != this->winId()) {
    return;
  }

  auto jxCommand = JIncomingCommand(message);

  // if (!jxCommand.toHandleCommand(this->winId()))
  //   return;
  switch (jxCommand.getCommand()) {
    case IC::INIT:
      clientIsUsingSafari = jxCommand.arg(3).toStdString() == "true";
      break;
    case IC::WINDOWCLOSED:
      handleWindowClosed();
      break;
    case IC::KEYBOARDEVENT:
      handleKeyMessage(jxCommand);
      break;
    case IC::CLIPBOARDUPDATE:
      handleClipboardUpdate(jxCommand);
      break;
    case IC::MOUSEEVENT:
      handleMouseEvent(jxCommand);
      break;
    case IC::MOUSEWHEELEVENT:
      handleMouseWheel(jxCommand);
      break;
    case IC::FOCUSEVENT:
      handleFocusEvent(jxCommand);
      break;
    case IC::TOUCHEVENT:
      handleTouchEvent(jxCommand);
      break;
    case IC::QUALITY:
      handleQualityEvent(jxCommand);
      break;
    case IC::DEVICEPIXELRATIO:
      handlePixelRatioEvent(jxCommand);
      break;
    case IC::RESIZE:
      handleResize(jxCommand);
      break;
    case IC::POPUPCLOSED:
      handlePopupClosed(jxCommand);
      break;
    case IC::PING:
      handlePing();
      break;
    case IC::DRAGANDDROPFILEUPLOADSTART:
      dragAndDropUploadStarted(jxCommand);
      break;
    case IC::DRAGOVER:
      dragOverEvent(jxCommand);
      break;
    case IC::PAUSEVIDEOSTREAMING:
      handlePauseVideoStreaming();
      break;
    case IC::RESUMEVIDEOSTREAMING:
      handleResumeVideoStreaming();
      break;
    case IC::CLOSEWINDOWBYID:
      handleCloseWindowById(jxCommand);
      break;
    default:
      // qDebug() << "Some unknown command ... " << message;
      break;
  }
}

void JxWindow::handlePopupClosed(JIncomingCommand command) {
  qInfo() << "[JxWindow::handlePopupClosed]";
  WId popupId = static_cast<WId>(command.arg(1).toInt());
  auto windows = QGuiApplication::allWindows();
  auto topLevelWindows = QGuiApplication::topLevelWindows();

  for (int i = 0; i < windows.length(); i++) {
    // if (windows[i]->objectName() == "JPopupWindowClassWindow" && popupId == windows[i]->winId())
    if (popupId == windows[i]->winId()) {
      qInfo() << "closing window" << windows[i]->winId();
      windows[i]->close();
      break;
    }
  }

  topLevelWindows[0]->requestActivate();  // activate the main window again
}

void JxWindow::onBinaryMessage(void* pClient, QByteArray message, WId winId) {
  Q_UNUSED(pClient);
  if (winId != this->winId()) {
    return;
  }

  QByteArray data = message;
  if (message[0] == 'c' && message[1] == 'a' && message[2] == 'm') {
    if (!m_webcam_enabled)
      return;

    data.remove(0, 3);
    m_webcam->write(data);
  } else if (message[0] == 'm' && message[1] == 'i' && message[2] == 'c') {
    data.remove(0, 3);
    m_mic->write(data);
  } else if (message[0] == 'd')  // for draganddropfileupload
  {
    // As dragndrop was implemented, it was clear directory traversal was possible, but that's fixed
    // now :)
    // processDnDUploadCommand(message);
  } else {
    // qInfo() << message;
  }
}

int eventKeyToInt(QString eventKey) {
  int key = chars[eventKey];
  return key;
}
// int JxWindow::codeToKey(QString code)
// {
//   if (code.startsWith("Key"))
//     return code.at(3).unicode();
//   if (code.startsWith("Digit"))
//     return code.at(5).unicode();
//   return eventKeyToInt(code);
// }

void JxWindow::handleKeyMessage(JIncomingCommand command) {
  JxWsServer::instance().windowReadyForAudio(winId());
  QString code = command.arg(1);
  QString text = command.arg(2);
  QString releaseOrPress = command.arg(3);
  int key;
  if (code.startsWith("Key")) {
    // key = code.at(3).unicode();
    key = text.at(0).unicode() - 32;
  } else if (code.startsWith("Digit")) {
    key = code.at(5).unicode();
  } else {
    // key = eventKeyToInt(text);
    if (code.startsWith("Numpad")) {
      key = eventKeyToInt(text);
    } else {
      key = eventKeyToInt(code);
    }
    if (key > 61) {  // smaller than 61 are the exceptions on the list
      text = "";     // etje
    }
  }
  if (text == "semicolonneke") {
    text = ";";
  }
  if (code == "Space") {
    key = 32;
  }

  Qt::KeyboardModifiers modifiers = Qt::KeyboardModifiers(command.arg(4).toInt());

  if (releaseOrPress == "0") {
    if (text.length() > 1) {
      QStringList characters = text.split("", Qt::SkipEmptyParts);
      for (const auto& character : characters) {
        this->onKeyEvent(QEvent::KeyPress, key, modifiers,
                         character);  // Browsers are weird in their implementation, only mobile
                                      // comes here (on purpose)
      }
    } else {
      this->onKeyEvent(QEvent::KeyPress, key, modifiers,
                       text);  // Browsers are weird in their implementation, only mobile
                               // comes here (on purpose)
    }
  }

  if (releaseOrPress == "1") {
    this->onKeyEvent(QEvent::KeyRelease, key, modifiers, text);
  }

  if (releaseOrPress == "2") {
    this->onKeyEvent(QEvent::KeyPress, key, modifiers, text);
  }
}

void JxWindow::raise() {}

void JxWindow::handleClipboardUpdate(JIncomingCommand command) {
  // This puts the text of the clipboard of the user in the clipboard of the browser.
  // The actual pasting is handled by the CTRL + V that is sent from the frontend.
  QString type = QString(command.arg(1));
  QByteArray bytes = QByteArray::fromBase64(command.arg(2).toUtf8());

  if (type == "text") {
    QGuiApplication::clipboard()->setText(QString(bytes));
  }
  if (type == "image") {
    QImage img;
    img.loadFromData(bytes);
    QGuiApplication::clipboard()->setImage(img);
  }

  if (clientIsUsingSafari) {
    triggerKeyEvent(QEvent::KeyPress, 16777250, 67108864, "");
    triggerKeyEvent(QEvent::KeyPress, 86, 67108864, "v");
    triggerKeyEvent(QEvent::KeyRelease, 16777250, 0, "");
  }
}

void JxWindow::triggerKeyEvent(QEvent::Type event, int key, int modifierKey, QString text) {
  this->onKeyEvent(event, key, Qt::KeyboardModifiers(modifierKey), text);
}

void JxWindow::handleResize(JIncomingCommand command) {
  int width = command.arg(1).toInt();
  int height = command.arg(2).toInt();
  if (width == 0 || height == 0)
    return;  // "Quick and dirty" This fixes the dimensions not set bug #476
             // https://labs.jimber.org/jimber_broker/jimberqtskia/-/issues/476
  _cleanGeometry = QRect(0, 0, width, height);
  QWindowSystemInterface::handleScreenGeometryChange(
      QGuiApplication::primaryScreen(), QRect(0, 0, width, height), QRect(0, 0, 5000, 5000));
  // QWindowSystemInterface::handleScreenGeometryChange(QGuiApplication::primaryScreen(), QRect(0,
  // 0, width, height), QRect(0, 0, 2560, 1440));
  float ratio = QGuiApplication::primaryScreen()->devicePixelRatio();
  this->window->resize(width / ratio, height / ratio);
}

void JxWindow::handleMouseEvent(JIncomingCommand command) {
  // this->window->setFocus(); // test out for focus stuff
  // qInfo() << "handlemouseeventfocus??";
  QString str = QString(QByteArray::fromBase64(command.arg(1).toStdString().c_str()));
  QJsonDocument jsonResponse = QJsonDocument::fromJson(str.toUtf8());
  QJsonObject object = jsonResponse.object();
  // qInfo() << "[JxWindow::handleMouseEvent]" << this->window->framePosition() << object;
  MouseEvent mouse(object, this->window->framePosition());
  if (mouse.EventType() == "mousedown") {
    this->onMousePressEvent(mouse);
  } else if (mouse.EventType() == "mouseup") {
    this->onMouseReleaseEvent(mouse);
  } else if (mouse.EventType() == "mousemove") {
    this->onMouseMoveEvent(mouse);
  } else if (mouse.EventType() == "mouseenter") {
    this->onMouseEnterEvent(mouse);
  } else if (mouse.EventType() == "mouseleave") {
    this->onMouseLeaveEvent(mouse);
  }
}

void JxWindow::handleFocusEvent(JIncomingCommand command) {
  if (command.arg(1) == "out") {
    // JxIntegration::instance()->inputContext()->hideInputPanel();
    // JxIntegration::instance()->clearFocus(false)(this->window->winId());
    // JxIntegration::instance()->inputContext()->hideInputPanel();
    // JxStreamer::instance().pause();
  } else if (command.arg(1) == "in") {
    // JxIntegration::instance()->inputContext()->hideInputPanel();
    // this->window->requestActivate();
    // requestActivateWindow();
    // JxIntegration::instance()->focusWindow(false)(this->window->winId());
    // JxStreamer::instance().resume();
  }
}
void JxWindow::onKeyEvent(QEvent::Type type, int code, int modifiers, const QString& text) {
  if (text != "Dead") {
    QKeyEvent event(type, code, Qt::KeyboardModifiers(modifiers), text);
    QWindowSystemInterface::handleKeyEvent(
        this->window, type, code, Qt::KeyboardModifiers(modifiers),
        text);  // This forces the event on the window and lets it bubble
  }
}

void JxWindow::setGeometry(const QRect& rect) {
  // _geometry = QRect(0, 0, rect.width(), rect.height());
  _geometry = rect;

  if (this->window->objectName() == "QMainWindowClassWindow" ||
      this->window->objectName() == "JPopupWindowClassWindow") {
    qInfo() << "Finding streamer in jxwindow for objectname " << this->window->objectName()
            << " and the winid is " << this->window->winId();
    auto streamer = JxBackingStore::streamers().value(this->window->winId());
    if (streamer == nullptr) {
      qInfo() << "No streamer found! Something went really wrong ";
      return;
    }
    JxBackingStore::streamers()
        .value(this->window->winId())
        ->resize(QSize(rect.width(), rect.height()));
  }

  QWindowSystemInterface::handleGeometryChange(this->window, rect);
}

QRect JxWindow::geometry() const {
  return _geometry;
}

bool JxWindow::windowEvent(QEvent* event) {
  return QPlatformWindow::windowEvent(event);
}

void JxWindow::onMousePressEvent(MouseEvent& mouse) {
  JxWsServer::instance().windowReadyForAudio(winId());
  QMouseEvent* eventPress = new QMouseEvent(
      QEvent::MouseButtonPress, QPoint(mouse.LayerX(), mouse.LayerY()),
      QPoint(mouse.LayerX(), mouse.LayerY()), mouse.which(), mouse.which(), mouse.modifiers());
  QApplication::postEvent(this->window, eventPress);
  _leftMouseButton = "down";
}

void JxWindow::onMouseReleaseEvent(MouseEvent& mouse) {
  QMouseEvent* eventPress = new QMouseEvent(
      QEvent::MouseButtonRelease, QPoint(mouse.LayerX(), mouse.LayerY()),
      QPoint(mouse.LayerX(), mouse.LayerY()), mouse.which(), mouse.which(), mouse.modifiers());
  QApplication::postEvent(this->window, eventPress);
  _leftMouseButton = "up";
}

void JxWindow::onMouseMoveEvent(MouseEvent& mouse) {
  // if (_leftMouseButton == "down")
  // {
  //   QMouseEvent *eventMove = new QMouseEvent(QEvent::MouseMove, QPoint(mouse.LayerX(),
  //   mouse.LayerY()), QPoint(mouse.LayerX(), mouse.LayerY()), mouse.which(), mouse.which(),
  //   mouse.modifiers()); QApplication::postEvent(this->window, eventMove);
  // }
  // else
  // {
  //   QHoverEvent *hoverEvent = new QHoverEvent(QEvent::HoverMove, QPoint(mouse.LayerX(),
  //   mouse.LayerY()), QPoint(mouse.LayerX(), mouse.LayerY()));
  //   QApplication::postEvent(this->window, hoverEvent); QMouseEvent *eventMove = new
  //   QMouseEvent(QEvent::MouseMove, QPoint(mouse.LayerX(), mouse.LayerY()), QPoint(mouse.LayerX(),
  //   mouse.LayerY()), mouse.which(), mouse.which(), mouse.modifiers());
  //   QApplication::postEvent(this->window, eventMove);
  // }
  const QPoint local(mouse.LayerX(), mouse.LayerY());
  const QPoint global(mouse.LayerX(), mouse.LayerY());
  // qInfo() << this->window;

  // qInfo() << "[JxWindow::onMouseMoveEvent]" << window->isTopLevel();

  QWindowSystemInterface::handleMouseEvent(
      this->window, 0, local, global, mouse.which(), mouse.which(), QEvent::Type::MouseMove,
      mouse.modifiers(), Qt::MouseEventSource::MouseEventSynthesizedByApplication);
}

void JxWindow::onMouseEnterEvent(MouseEvent& mouse) {
  // mouseevent to put the window on top of the screen
  // 17/03/2021 this seems to force a focus input field
  QApplication::postEvent(this->window,
                          new QMouseEvent(QMouseEvent::MouseButtonPress, QPoint(0, 0), QPoint(0, 0),
                                          QPoint(0, 0), Qt::NoButton, Qt::NoButton, Qt::NoModifier,
                                          Qt::MouseEventSynthesizedBySystem));

  const QPoint position(mouse.LayerX(), mouse.LayerY());
  QWindowSystemInterface::handleEnterEvent(this->window, position, position);
}

void JxWindow::onMouseLeaveEvent(MouseEvent& mouse) {
  QEvent* leaveEvent = new QEvent(QEvent::Leave);
  QApplication::postEvent(this->window, leaveEvent);
  QHoverEvent* hoverLeaveEvent =
      new QHoverEvent(QEvent::HoverLeave, QPoint(mouse.LayerX(), mouse.LayerY()),
                      QPoint(mouse.LayerX(), mouse.LayerY()));
  QApplication::postEvent(this->window, hoverLeaveEvent);
}

bool JxWindow::setKeyboardGrabEnabled(bool grab) {
  qInfo() << "setKeyBoardGrabEnabled " << grab;
  return false;
}

bool JxWindow::setMouseGrabEnabled(bool grab) {
  qInfo() << "setMouseGrabEnabled " << grab;
  return false;
}

void JxWindow::handleMouseWheel(JIncomingCommand command) {
  double layerX = command.arg(1).toDouble();
  double layerY = command.arg(2).toDouble();
  double clientX = command.arg(3).toDouble();
  double clientY = command.arg(4).toDouble();
  int deltaX = static_cast<int>(command.arg(6).toDouble());
  int deltaY = static_cast<int>(command.arg(6).toDouble());
  // qInfo() << layerX << layerY << clientX << clientY;
  Qt::KeyboardModifiers modifiers = Qt::KeyboardModifiers(command.arg(7).toInt());

  auto orientation = deltaY != 0 ? Qt::Vertical : Qt::Horizontal;
  QPointF localPos(layerX, layerY);
  QPointF globalPos(clientX,
                    clientY);  // probably wrong

  QPoint point = (orientation == Qt::Vertical) ? QPoint(0, -deltaY * 2) : QPoint(-deltaX * 2, 0);
  QWindowSystemInterface::handleWheelEvent(this->window,

                                           localPos, globalPos, QPoint(), point, modifiers);
}

void JxWindow::handleTouchEvent(JIncomingCommand command) {
  JxWsServer::instance().windowReadyForAudio(winId());

  QString str = QString(QByteArray::fromBase64(command.arg(1).toStdString().c_str()));

  QJsonDocument jsonResponse = QJsonDocument::fromJson(str.toUtf8());

  QJsonObject object = jsonResponse.object();

  const auto time = object.value("time").toDouble();

  if (object.value("event").toString() == QStringLiteral("touchcancel")) {
    QWindowSystemInterface::handleTouchCancelEvent(this->window, time, _touchDevice,
                                                   Qt::NoModifier);
  } else {
    QList<QWindowSystemInterface::TouchPoint> points;

    auto changedTouches = object.value("changedTouches").toArray();
    for (const auto& touch : changedTouches) {
      auto point = TouchObject(window->width(), window->height(), object.value("event").toString(),
                               touch.toObject())
                       .point();
      points.append(point);
    }

    auto stationaryTouches = object.value("stationaryTouches").toArray();
    for (const auto& touch : stationaryTouches) {
      auto point =
          TouchObject(window->width(), window->height(), QString("stationary"), touch.toObject())
              .point();
      points.append(point);
    }

    QWindowSystemInterface::handleTouchEvent(this->window, time, _touchDevice, points,
                                             Qt::NoModifier);
  }
}

void JxWindow::handleQualityEvent(JIncomingCommand command) {
  JxBackingStore::streamers().value(this->window->winId())->changeQuality(command.arg(1).toInt());
}

void JxWindow::handlePixelRatioEvent(JIncomingCommand command) {
  float ratio = command.arg(1).toFloat();
  QHighDpiScaling::setScreenFactor(QGuiApplication::primaryScreen(), ratio);
  JxBackingStore::streamers().value(this->window->winId())->setPixelRatio(ratio);
  // JxStreamer::instance().setPixelRatio(ratio); todo
  this->window->resize(_cleanGeometry.width() / ratio, _cleanGeometry.height() / ratio + 1);
}

void JxWindow::handlePing() {
  JCommand(OC::PONG, this->window->winId());
}

void JxWindow::dragOverEvent(JIncomingCommand command) {
  // return;
  int x = command.arg(1).toInt();
  int y = command.arg(2).toInt();
  QPoint globalCursorPos(x, y);
  Qt::MouseButtons buttons = Qt::LeftButton;
  Qt::KeyboardModifiers modifiers = QApplication::keyboardModifiers();
  auto actions = Qt::CopyAction | Qt::MoveAction | Qt::LinkAction;

  QWindowSystemInterface::handleDrag(this->window, m_tmpMime, globalCursorPos, actions, buttons,
                                     modifiers);
}

void JxWindow::dragAndDropUploadStarted(JIncomingCommand command) {
  QUuid uploadId = command.arg(1);
  int x = command.arg(2).toInt();
  int y = command.arg(3).toInt();
  m_upload = QSharedPointer<Upload>::create(uploadId);
  m_upload->setPos(x, y);
}

void JxWindow::handlePauseVideoStreaming() {
  JxBackingStore::streamers().value(this->window->winId())->pause();
}

void JxWindow::handleResumeVideoStreaming() {
  JxBackingStore::streamers().value(this->window->winId())->resume();
}

void JxWindow::handleWindowClosed() {
  // if (JxWsServer::instance().countConnectedClients() <= 1)
  // {
  qInfo() << "handleWindowClosed exit";
  //   exit(0);
  //   QGuiApplication::quit();
  // } else {
  //       qInfo() << "handleWindowClosed";

  // }
}

void JxWindow::handleCloseWindowById(const JIncomingCommand& command) {
  int winId = command.arg(1).toInt();
  JxIntegration::instance()->closeWindow(false)(winId);
}

void JxWindow::fileUploadFinished(QUuid uploadId, QList<QUrl> fileList) {
  if (!m_upload) {
    return;
  }
  if (m_upload->getId() != uploadId) {
    return;
  }
  QMimeData* mimeData = new QMimeData();

  mimeData->setUrls(fileList);

  auto actions = Qt::CopyAction | Qt::MoveAction | Qt::LinkAction;

  QPoint globalCursorPos = QPoint(m_upload->getX(), m_upload->getY());
  Qt::MouseButtons buttons = QApplication::mouseButtons();
  Qt::KeyboardModifiers modifiers = QApplication::keyboardModifiers();
  QWindowSystemInterface::handleDrag(this->window, nullptr, globalCursorPos, actions, buttons,
                                     modifiers);  // cancel the previous one

  QWindowSystemInterface::handleDrag(this->window, mimeData, globalCursorPos, actions, buttons,
                                     modifiers);

  QWindowSystemInterface::handleDrag(this->window, mimeData, globalCursorPos, actions, buttons,
                                     modifiers);  // twice because of google products

  QWindowSystemInterface::handleDrop(this->window, mimeData, globalCursorPos, actions, buttons,
                                     modifiers);
}

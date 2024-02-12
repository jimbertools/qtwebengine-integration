#include "jDrag.h"
#include <QtGui/qscreen.h>
#include <qguiapplication.h>
#include <qpa/qwindowsysteminterface.h>
#include <QMimeData>
#include <QUrl>
#include "JCommandHandler.h"

QT_BEGIN_NAMESPACE

JDrag::JDrag() {}
JDrag::~JDrag() {}
void JDrag::startDrag() {
  qInfo() << "[JDrag::startDrag]";
  setUseCompositing(QGuiApplication::primaryScreen());
  setScreen(QGuiApplication::primaryScreen());
  QBasicDrag::startDrag();
  const QPoint location(QCursor::pos());
  move(location, QGuiApplication::mouseButtons(), QGuiApplication::keyboardModifiers());

  int winId = QGuiApplication::focusWindow()->winId();
  JCommand(OC::CURSOR, winId) << QString::number(Qt::ClosedHandCursor);
}

void JDrag::move(const QPoint& globalPos, Qt::MouseButtons b, Qt::KeyboardModifiers mods) {
  QMimeData* mimeData = new QMimeData();
  QList<QUrl> list;
  list.append(QUrl("/home/amol/Downloads/chrome.png"));
  mimeData->setUrls(list);
  lastMousePosition = globalPos;
  // QPlatformDragQtResponse qt_response = QWindowSystemInterface::handleDrag(
  QWindowSystemInterface::handleDrag(
      QGuiApplication::focusWindow(), mimeData, globalPos,
      Qt::DropActions::enum_type::MoveAction | Qt::DropActions::enum_type::CopyAction, b, mods);
}

void JDrag::drop(const QPoint& globalPos, Qt::MouseButtons b, Qt::KeyboardModifiers mods) {
  QBasicDrag::drop(globalPos, b, mods);
  QMimeData* mimeData = new QMimeData();
  QList<QUrl> list;
  list.append(QUrl("/home/amol/Downloads/chrome.png"));
  mimeData->setUrls(list);

  QPlatformDropQtResponse response = QWindowSystemInterface::handleDrop(
      QGuiApplication::focusWindow(), mimeData, globalPos,
      Qt::DropActions::enum_type::MoveAction | Qt::DropActions::enum_type::CopyAction, b, mods);
  qInfo() << response.isAccepted();
}

void JDrag::endDrag() {
  qInfo() << "[JDrag::endDrag]";
  QBasicDrag::endDrag();
  QWindowSystemInterface::handleDrop(
      QGuiApplication::focusWindow(), nullptr, lastMousePosition,
      Qt::DropActions::enum_type::MoveAction | Qt::DropActions::enum_type::CopyAction,
      Qt::MouseButtons(), Qt::KeyboardModifiers());
  int winId = QGuiApplication::focusWindow()->winId();
  JCommand(OC::CURSOR, winId) << QString::number(Qt::ArrowCursor);
}

QT_END_NAMESPACE
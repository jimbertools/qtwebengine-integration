#pragma once

#include <QGuiApplication>
#include <QJsonObject>
#include <QScreen>
#include <iostream>
#include <string>

class MouseEvent {
  int _identifier;
  double _clientX;
  double _clientY;
  double _windowOffsetX;
  double _windowOffsetY;
  QString _eventType;
  Qt::MouseButton _which = Qt::NoButton;
  Qt::KeyboardModifiers _modifiers;

 public:
  MouseEvent(const QJsonObject& object, const QPoint& windowOffset) {
    switch (object.value("which").toInt()) {
      case 1:
        _which = Qt::LeftButton;
        break;
      case 2:
        _which = Qt::MidButton;
        break;
      case 3:
        _which = Qt::RightButton;
        break;
    }

    _eventType = object.value("type").toString();
    _clientX = object.value("clientX").toDouble();
    _clientY = object.value("clientY").toDouble();
    _modifiers = Qt::KeyboardModifiers(object.value("modifiers").toInt());
    _windowOffsetX = windowOffset.x();
    _windowOffsetY = windowOffset.y();
  };

  double offsetX() const {
    return _windowOffsetX * QGuiApplication::primaryScreen()->devicePixelRatio();
  }
  double offsetY() const {
    return _windowOffsetY * QGuiApplication::primaryScreen()->devicePixelRatio();
  }
  // double LayerX(){ return (_clientX - (_windowOffsetX *
  // QGuiApplication::primaryScreen()->devicePixelRatio())); } double LayerY(){ return (_clientY -
  // (_windowOffsetY * QGuiApplication::primaryScreen()->devicePixelRatio())); }

  Qt::KeyboardModifiers modifiers() const { return _modifiers; }
  double LayerX() const { return (_clientX); }
  double LayerY() const { return (_clientY); }
  QString EventType() const { return _eventType; }
  Qt::MouseButton which() const { return _which; }
};
QDebug operator<<(QDebug debug, const MouseEvent& event);
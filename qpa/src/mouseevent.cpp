#include "mouseevent.h"

QDebug operator<<(QDebug debug, const MouseEvent& event) {
  return debug << "ClientX" << event.LayerX() << "ClientY" << event.LayerY() << "offsetX"
               << event.offsetX() << "offsetY" << event.offsetY() << "EventType"
               << event.EventType() << "which" << event.which() << "modifiers" << event.modifiers();
};
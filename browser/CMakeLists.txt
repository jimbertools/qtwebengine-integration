cmake_minimum_required(VERSION 3.16)
project(Browser)
# set(Qt5_DIR "~/Qt/5.15.2/gcc_64/lib/cmake/Qt5")
find_package(
  Qt5
  COMPONENTS Core Widgets Multimedia WebEngine WebEngineWidgets Sql
  REQUIRED)

set(CMAKE_BUILD_TYPE RelWithDebInfo)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++17")
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTOUIC ON)
set(CMAKE_AUTORCC ON)
set(SOURCES
    src/main.cpp
    src/jimberx264browser.cpp
    src/jimberx264webview.cpp
    src/jimberx264webpage.cpp
    src/jxfiledownload.cpp
    src/jpopupwindow.cpp
    src/socketcommunication.cpp
    src/jxwindowcontroller.cpp
    src/jnotificationhandler.cpp
    src/jimberx264browser.h
    src/socketcommunication.h
    src/jimberx264webview.h
    src/jimberx264webpage.h
    src/JCommandHandler.h
    src/jpopupwindow.h
    src/jnotificationhandler.h
    src/proto.h
    browser.qrc)

add_subdirectory(src/uploadmanager)
add_subdirectory(src/passwordmanager)
add_subdirectory(src/resourceproxy)
add_subdirectory(src/adblock)
# target_include_directories(src) find_library(QtWebEngineWidgets
# "/home/amol/Code/Jimber/jimberqtskia/browser/src/3rdparty/QtPromise")
add_executable(browser ${SOURCES} ${UPLOADSOURCES})
target_include_directories(browser PUBLIC "src/uploadmanager")
target_include_directories(
  browser PUBLIC $ENV{CUSTOM_WEB_ENGINE_DIR}/include/QtWebEngineWidgets)
message($ENV{CUSTOM_WEB_ENGINE_DIR}/include/QtWebEngineWidgets)
target_include_directories(browser PUBLIC "src/3rdparty/QtPromise")
target_include_directories(browser PUBLIC $ENV{CUSTOM_WEB_ENGINE_DIR}/include)
target_link_libraries(browser
                      $ENV{CUSTOM_WEB_ENGINE_DIR}/lib/libQt5WebEngineWidgets.so)
target_link_libraries(browser
                      $ENV{CUSTOM_WEB_ENGINE_DIR}/lib/libQt5WebEngineCore.so)
target_link_libraries(browser
                      $ENV{CUSTOM_WEB_ENGINE_DIR}/lib/libQt5WebEngine.so)

# target_link_libraries(browser $ENV{CUSTOM_WEB_ENGINE_DIR}/libprotobuf.so)
target_link_libraries(
  browser
  Qt5::Core
  Qt5::Widgets
  Qt5::Sql
  Qt5::WebEngine
  Qt5::WebEngineWidgets
  brotlienc
  brotlidec
  httpServer)
# target_link_libraries(browser Qt5::WebEngine) set_property(TARGET browser
# PROPERTY LINK_LIBRARIES
# /home/amol/Code/Jimber/browser/browser_profiling/lib/libQt5WebEngine.so)
# set_target_properties(WebEngineWidgets PROPERTIES
# "IMPORTED_SONAME_WEBENGINEWIDGETS"
# "/home/amol/Code/Jimber/browser/browser_profiling/lib/libQt5WebEngineWidgets.so"
# )

# add_library(QtWebEngineWidgets
# /home/amol/Code/Jimber/browser/browser_profiling/lib/libQt5WebEngineWidgets.so)

# add_library(WebEngine SHARED IMPORTED) set_property(TARGET WebEngine PROPERTY
# IMPORTED_LOCATION
# "/home/amol/Code/Jimber/browser/browser_profiling/lib/libQt5WebEngine.so")
# target_link_libraries(browser WebEngine)

# add_library(WebEngineWidgets SHARED IMPORTED) set_property(TARGET
# WebEngineWidgets PROPERTY IMPORTED_LOCATION
# "/home/amol/Code/Jimber/browser/browser_profiling/lib/libQt5WebEngineWidgets.so")

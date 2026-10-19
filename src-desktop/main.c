#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <winsock2.h>
#include <ws2tcpip.h>
#include <shlwapi.h>
#include <shellapi.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <process.h>

#pragma comment(lib, "ws2_32.lib")
#pragma comment(lib, "shlwapi.lib")
#pragma comment(lib, "shell32.lib")

static int g_port = 48291;
static volatile BOOL g_running = TRUE;
static WCHAR g_appDir[MAX_PATH];

static const char* get_mime_type(const WCHAR* path) {
    const WCHAR* ext = PathFindExtensionW(path);
    if (!ext) return "application/octet-stream";
    if (_wcsicmp(ext, L".html") == 0 || _wcsicmp(ext, L".htm") == 0) return "text/html; charset=utf-8";
    if (_wcsicmp(ext, L".js") == 0 || _wcsicmp(ext, L".mjs") == 0) return "application/javascript; charset=utf-8";
    if (_wcsicmp(ext, L".css") == 0) return "text/css; charset=utf-8";
    if (_wcsicmp(ext, L".json") == 0) return "application/json; charset=utf-8";
    if (_wcsicmp(ext, L".svg") == 0) return "image/svg+xml";
    if (_wcsicmp(ext, L".png") == 0) return "image/png";
    if (_wcsicmp(ext, L".jpg") == 0 || _wcsicmp(ext, L".jpeg") == 0) return "image/jpeg";
    if (_wcsicmp(ext, L".ico") == 0) return "image/x-icon";
    if (_wcsicmp(ext, L".woff2") == 0) return "font/woff2";
    if (_wcsicmp(ext, L".woff") == 0) return "font/woff";
    if (_wcsicmp(ext, L".ttf") == 0) return "font/ttf";
    return "application/octet-stream";
}

static void send_all(SOCKET client, const char* data, int len) {
    int totalSent = 0;
    while (totalSent < len) {
        int sent = send(client, data + totalSent, len - totalSent, 0);
        if (sent <= 0) break;
        totalSent += sent;
    }
}

static void send_http_response(SOCKET client, int status, const char* statusText, const char* mime, const char* body, DWORD bodyLen) {
    char header[512];
    int headerLen = snprintf(header, sizeof(header),
        "HTTP/1.1 %d %s\r\n"
        "Server: VYAPRIX-Embedded/1.0\r\n"
        "Content-Type: %s\r\n"
        "Content-Length: %lu\r\n"
        "Access-Control-Allow-Origin: *\r\n"
        "Connection: close\r\n"
        "\r\n",
        status, statusText, mime, bodyLen);
    send_all(client, header, headerLen);
    if (body && bodyLen > 0) {
        send_all(client, body, (int)bodyLen);
    }
}

static void handle_client(SOCKET client) {
    char req[4096];
    int recvBytes = recv(client, req, sizeof(req) - 1, 0);
    if (recvBytes <= 0) {
        closesocket(client);
        return;
    }
    req[recvBytes] = '\0';

    char method[16], uri[2048];
    if (sscanf(req, "%15s %2047s", method, uri) < 2) {
        closesocket(client);
        return;
    }

    // Strip query string if present
    char* q = strchr(uri, '?');
    if (q) *q = '\0';

    // Decode URL or default to index.html
    char cleanUri[2048];
    if (strcmp(uri, "/") == 0 || strlen(uri) == 0) {
        strcpy(cleanUri, "index.html");
    } else {
        // Strip leading slashes to avoid PathAppend root-relative override
        const char* p = uri;
        while (*p == '/' || *p == '\\') {
            p++;
        }
        if (*p == '\0') {
            strcpy(cleanUri, "index.html");
        } else {
            strncpy(cleanUri, p, sizeof(cleanUri) - 1);
            cleanUri[sizeof(cleanUri) - 1] = '\0';
        }
    }

    // Build absolute file path to installed app folder
    WCHAR targetPath[MAX_PATH];
    wcscpy(targetPath, g_appDir);
    PathAppendW(targetPath, L"app");

    // Convert relative path to WCHAR
    WCHAR relPath[MAX_PATH];
    MultiByteToWideChar(CP_UTF8, 0, cleanUri, -1, relPath, MAX_PATH);

    // Replace forward slashes with backslashes
    for (int i = 0; relPath[i]; i++) {
        if (relPath[i] == L'/') relPath[i] = L'\\';
    }
    PathAppendW(targetPath, relPath);

    // If file doesn't exist, SPA fallback to index.html
    if (!PathFileExistsW(targetPath)) {
        wcscpy(targetPath, g_appDir);
        PathAppendW(targetPath, L"app\\index.html");
    }

    // Open and read file
    HANDLE hFile = CreateFileW(targetPath, GENERIC_READ, FILE_SHARE_READ, NULL, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
    if (hFile == INVALID_HANDLE_VALUE) {
        const char* notFound = "<h1>404 Not Found - VYAPRIX</h1>";
        send_http_response(client, 404, "Not Found", "text/html", notFound, (DWORD)strlen(notFound));
        closesocket(client);
        return;
    }

    DWORD fileSize = GetFileSize(hFile, NULL);
    char* buffer = (char*)malloc(fileSize);
    if (buffer) {
        DWORD readBytes = 0;
        ReadFile(hFile, buffer, fileSize, &readBytes, NULL);
        send_http_response(client, 200, "OK", get_mime_type(targetPath), buffer, readBytes);
        free(buffer);
    }
    CloseHandle(hFile);
    closesocket(client);
}

static unsigned __stdcall http_server_thread(void* arg) {
    (void)arg;
    SOCKET listenSocket = INVALID_SOCKET;
    struct sockaddr_in addr;

    for (int p = 48291; p < 48350; p++) {
        listenSocket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
        if (listenSocket == INVALID_SOCKET) break;

        BOOL opt = TRUE;
        setsockopt(listenSocket, SOL_SOCKET, SO_REUSEADDR, (const char*)&opt, sizeof(opt));

        memset(&addr, 0, sizeof(addr));
        addr.sin_family = AF_INET;
        addr.sin_addr.s_addr = inet_addr("127.0.0.1");
        addr.sin_port = htons((u_short)p);

        if (bind(listenSocket, (struct sockaddr*)&addr, sizeof(addr)) == 0) {
            g_port = p;
            break;
        }
        closesocket(listenSocket);
        listenSocket = INVALID_SOCKET;
    }

    if (listenSocket == INVALID_SOCKET || listen(listenSocket, 16) != 0) {
        return 1;
    }

    while (g_running) {
        fd_set readfds;
        FD_ZERO(&readfds);
        FD_SET(listenSocket, &readfds);
        struct timeval tv;
        tv.tv_sec = 1;
        tv.tv_usec = 0;

        int sel = select(0, &readfds, NULL, NULL, &tv);
        if (sel > 0 && FD_ISSET(listenSocket, &readfds)) {
            SOCKET client = accept(listenSocket, NULL, NULL);
            if (client != INVALID_SOCKET) {
                handle_client(client);
            }
        }
    }

    closesocket(listenSocket);
    return 0;
}

static BOOL find_browser(WCHAR* outPath, DWORD outLen) {
    // 1. Microsoft Edge (standard Windows 10/11 browser)
    WCHAR cand[MAX_PATH];
    ExpandEnvironmentStringsW(L"%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe", cand, MAX_PATH);
    if (PathFileExistsW(cand)) {
        wcsncpy(outPath, cand, outLen);
        return TRUE;
    }
    ExpandEnvironmentStringsW(L"%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe", cand, MAX_PATH);
    if (PathFileExistsW(cand)) {
        wcsncpy(outPath, cand, outLen);
        return TRUE;
    }

    // 2. Google Chrome
    ExpandEnvironmentStringsW(L"%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe", cand, MAX_PATH);
    if (PathFileExistsW(cand)) {
        wcsncpy(outPath, cand, outLen);
        return TRUE;
    }
    ExpandEnvironmentStringsW(L"%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe", cand, MAX_PATH);
    if (PathFileExistsW(cand)) {
        wcsncpy(outPath, cand, outLen);
        return TRUE;
    }

    // 3. Brave
    ExpandEnvironmentStringsW(L"%ProgramFiles%\\BraveSoftware\\Brave-Browser\\Application\\brave.exe", cand, MAX_PATH);
    if (PathFileExistsW(cand)) {
        wcsncpy(outPath, cand, outLen);
        return TRUE;
    }

    return FALSE;
}

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    (void)hInstance; (void)hPrevInstance; (void)lpCmdLine; (void)nCmdShow;

    // Get Directory of current executable
    GetModuleFileNameW(NULL, g_appDir, MAX_PATH);
    PathRemoveFileSpecW(g_appDir);

    // Initialize Winsock
    WSADATA wsa;
    if (WSAStartup(MAKEWORD(2, 2), &wsa) != 0) {
        MessageBoxW(NULL, L"Failed to initialize network system for VYAPRIX.", L"VYAPRIX Error", MB_ICONERROR | MB_OK);
        return 1;
    }

    // Start local embedded HTTP server thread
    uintptr_t hThread = _beginthreadex(NULL, 0, http_server_thread, NULL, 0, NULL);
    if (!hThread) {
        WSACleanup();
        return 1;
    }

    // Small delay to let server bind socket
    Sleep(200);

    // Prepare URL
    WCHAR appUrl[256];
    swprintf(appUrl, 256, L"http://127.0.0.1:%d/index.html", g_port);

    // Locate browser for native App Mode window
    WCHAR browserExe[MAX_PATH];
    if (find_browser(browserExe, MAX_PATH)) {
        // Prepare local profile directory for seamless offline state
        WCHAR userProfile[MAX_PATH];
        ExpandEnvironmentStringsW(L"%LOCALAPPDATA%\\VYAPRIX\\profile", userProfile, MAX_PATH);
        CreateDirectoryW(userProfile, NULL);

        WCHAR cmdLine[1024];
        swprintf(cmdLine, 1024, L"\"%s\" --app=\"%s\" --user-data-dir=\"%s\" --window-size=1280,820", browserExe, appUrl, userProfile);

        STARTUPINFOW si;
        PROCESS_INFORMATION pi;
        ZeroMemory(&si, sizeof(si));
        si.cb = sizeof(si);
        ZeroMemory(&pi, sizeof(pi));

        if (CreateProcessW(NULL, cmdLine, NULL, NULL, FALSE, 0, NULL, NULL, &si, &pi)) {
            // Wait for user to close the app window
            WaitForSingleObject(pi.hProcess, INFINITE);
            CloseHandle(pi.hProcess);
            CloseHandle(pi.hThread);
        } else {
            // Fallback to ShellExecute
            ShellExecuteW(NULL, L"open", appUrl, NULL, NULL, SW_SHOWNORMAL);
            // Give user time to view
            Sleep(15000);
        }
    } else {
        // Fallback if neither Edge nor Chrome is found
        ShellExecuteW(NULL, L"open", appUrl, NULL, NULL, SW_SHOWNORMAL);
        // Keep running in tray / background
        Sleep(30000);
    }

    g_running = FALSE;
    WaitForSingleObject((HANDLE)hThread, 2000);
    CloseHandle((HANDLE)hThread);
    WSACleanup();
    return 0;
}

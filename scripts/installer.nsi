; NSIS Modern User Interface script for VYAPRIX Billing & POS
!include "MUI2.nsh"
!include "FileFunc.nsh"

; General Configuration
Name "VYAPRIX Billing & POS"
OutFile "../public/VYAPRIX-Setup.exe"
Unicode True
InstallDir "$LOCALAPPDATA\Programs\VYAPRIX"
InstallDirRegKey HKCU "Software\VYAPRIX" "InstallDir"
RequestExecutionLevel user

; Version Information
VIProductVersion "1.0.0.0"
VIAddVersionKey "ProductName" "VYAPRIX Billing & POS"
VIAddVersionKey "CompanyName" "VYAPRIX (Powered by GOLDEN BAZAAR)"
VIAddVersionKey "LegalCopyright" "© 2026 VYAPRIX. All rights reserved."
VIAddVersionKey "FileDescription" "VYAPRIX Windows Desktop Installer"
VIAddVersionKey "FileVersion" "1.0.0.0"

; Interface Settings
!define MUI_ABORTWARNING
!define MUI_ICON "${NSISDIR}\Contrib\Graphics\Icons\modern-install-blue.ico"
!define MUI_UNICON "${NSISDIR}\Contrib\Graphics\Icons\modern-uninstall-blue.ico"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES

; Finish Page with Run Checkbox
!define MUI_FINISHPAGE_RUN "$INSTDIR\vyaprix.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Launch VYAPRIX Billing & POS"
!insertmacro MUI_PAGE_FINISH

; Uninstaller Pages
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; Languages
!insertmacro MUI_LANGUAGE "English"

; Installer Section
Section "VYAPRIX Application" SecApp
  SetOutPath "$INSTDIR"
  
  ; Write uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  
  ; Main application executable
  File "../src-desktop/vyaprix.exe"
  
  ; Web application assets directory
  SetOutPath "$INSTDIR\app"
  File /r /x "*.exe" "../dist/*.*"
  
  ; Shortcuts
  SetOutPath "$INSTDIR"
  CreateDirectory "$SMPROGRAMS\VYAPRIX"
  CreateShortcut "$SMPROGRAMS\VYAPRIX\VYAPRIX.lnk" "$INSTDIR\vyaprix.exe" "" "$INSTDIR\vyaprix.exe" 0
  CreateShortcut "$SMPROGRAMS\VYAPRIX\Uninstall VYAPRIX.lnk" "$INSTDIR\Uninstall.exe" "" "$INSTDIR\Uninstall.exe" 0
  CreateShortcut "$DESKTOP\VYAPRIX Billing & POS.lnk" "$INSTDIR\vyaprix.exe" "" "$INSTDIR\vyaprix.exe" 0

  ; Registry configuration for Add/Remove Programs
  WriteRegStr HKCU "Software\VYAPRIX" "InstallDir" "$INSTDIR"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\VYAPRIX" "DisplayName" "VYAPRIX Billing & POS"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\VYAPRIX" "UninstallString" "$\"$INSTDIR\Uninstall.exe$\""
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\VYAPRIX" "QuietUninstallString" "$\"$INSTDIR\Uninstall.exe$\" /S"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\VYAPRIX" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\VYAPRIX" "DisplayIcon" "$\"$INSTDIR\vyaprix.exe$\""
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\VYAPRIX" "Publisher" "VYAPRIX (Powered by GOLDEN BAZAAR)"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\VYAPRIX" "DisplayVersion" "1.0.0"
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\VYAPRIX" "NoModify" 1
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\VYAPRIX" "NoRepair" 1
SectionEnd

; Uninstaller Section
Section "Uninstall"
  Delete "$DESKTOP\VYAPRIX Billing & POS.lnk"
  Delete "$SMPROGRAMS\VYAPRIX\VYAPRIX.lnk"
  Delete "$SMPROGRAMS\VYAPRIX\Uninstall VYAPRIX.lnk"
  RMDir "$SMPROGRAMS\VYAPRIX"

  RMDir /r "$INSTDIR\app"
  Delete "$INSTDIR\vyaprix.exe"
  Delete "$INSTDIR\Uninstall.exe"
  RMDir "$INSTDIR"

  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\VYAPRIX"
  DeleteRegKey HKCU "Software\VYAPRIX"
SectionEnd

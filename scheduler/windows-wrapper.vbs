' Windows VBScript wrapper for running scheduler in background
' This script runs the Node.js scheduler without showing a window

Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the script directory
strScriptPath = WScript.ScriptFullName
strScriptDir = objFSO.GetParentFolderName(strScriptPath)

' Set log file path
strLogPath = objShell.ExpandEnvironmentStrings("%USERPROFILE%") & "\.ccsbatch\logs\scheduler.log"

' Ensure logs directory exists
strLogsDir = objFSO.GetParentFolderName(strLogPath)
If Not objFSO.FolderExists(strLogsDir) Then
    objFSO.CreateFolder(strLogsDir)
End If

' Get Node.js path
strNodePath = "node.exe"

' Build command - redirect both stdout and stderr to log file
strSchedulerPath = strScriptDir & "\scheduler.js"
strCommand = """" & strNodePath & """ """ & strSchedulerPath & """ >> """ & strLogPath & """ 2>&1"

' Run hidden (0 = hidden window, False = don't wait)
objShell.Run strCommand, 0, False

Set objShell = Nothing
Set objFSO = Nothing

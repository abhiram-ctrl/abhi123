@echo off
cd c:\Users\lucky\OneDrive\Desktop\projects\mainproject\backend
REM Cap Node memory to avoid OOM
set NODE_OPTIONS=--max-old-space-size=512
node index.js

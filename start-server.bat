@echo off
cd /d "%~dp0"
title May Chu Gia Lap Tablet - Be Hoc Vui
echo =================================================================
echo   DANG KHOI DONG SERVER XEM TRUOC CHO TABLET 10.9 INCH
echo   Khong can Admin - Chay truc tiep bang Python
echo =================================================================
echo.
echo   Dang tu dong mo giao dien gia lap Tablet...
start http://localhost:8000/simulator.html
echo.
echo   Link xem truc tiep (neu chua tu mo):
echo      http://localhost:8000/simulator.html
echo.
echo   (Dong cua so nay de tat may chu)
echo =================================================================
python -m http.server 8000

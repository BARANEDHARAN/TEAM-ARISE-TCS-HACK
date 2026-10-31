@echo off
title CLAIMMIND AI - Three-Portal Insurance Platform
cd /d "%~dp0backend"
echo ======================================================================
echo CLAIMMIND AI - Three-Portal Vehicle Claims Investigation Platform
echo ======================================================================
echo 1. Ensuring Database Tables and Demonstration Case are Seeded...
python seed_three_portals.py
echo 2. Starting Unified Server on http://127.0.0.1:8000 ...
echo ======================================================================
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause

@echo off
REM ==========================================================
REM LifeTag - Compile & Execute Academic JDBC Demonstration
REM ==========================================================
cd /d "%~dp0"
echo Compiling Java JDBC classes...
javac -cp "lib\mysql-connector-j-8.3.0.jar;." -d build *.java
if errorlevel 1 (
    echo [ERROR] Compilation failed.
    pause
    exit /b 1
)

echo.
echo Running LifeTagJDBCDemo against lifetag_db...
echo.
java -cp "build;lib\mysql-connector-j-8.3.0.jar;." LifeTagJDBCDemo
echo.
pause

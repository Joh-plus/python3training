@echo off
chcp 65001 >nul
echo ==========================================
echo GitHub Pages 更新ツール
echo ==========================================
echo.

set /p msg="変更内容を入力してください (エンターのみで 'サイト更新' となります): "
if "%msg%"=="" set msg=サイト更新

echo.
echo [1/3] 変更されたファイルを準備中...
git add .

echo.
echo [2/3] 変更を記録中...
git commit -m "%msg%"

echo.
echo [3/3] GitHubへ送信中...
git push

echo.
echo ==========================================
echo 完了しました！数分後にWebサイトに反映されます。
echo 何かキーを押すと終了します...
echo ==========================================
pause >nul

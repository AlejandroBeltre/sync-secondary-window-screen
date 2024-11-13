import * as vscode from 'vscode';

let secondaryPanel: vscode.WebviewPanel | undefined;

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('fileSyncExtension.openSecondaryWindow', () => {
        if (secondaryPanel) {
            secondaryPanel.reveal();
            return;
        }

        const currentEditor = vscode.window.activeTextEditor;
        if (!currentEditor) {
            vscode.window.showErrorMessage('No file is currently open');
            return;
        }

        // Create WebView panel
        secondaryPanel = vscode.window.createWebviewPanel(
            'secondaryEditor',
            'Secondary View',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        updateSecondaryContent(currentEditor);

        // Update content when editor changes
        context.subscriptions.push(
            vscode.window.onDidChangeActiveTextEditor(editor => {
                if (editor) {
                    updateSecondaryContent(editor);
                }
            }),
            vscode.workspace.onDidChangeTextDocument(event => {
                const activeEditor = vscode.window.activeTextEditor;
                if (activeEditor && event.document === activeEditor.document) {
                    updateSecondaryContent(activeEditor);
                }
            })
        );

        // Clean up when panel is closed
        secondaryPanel.onDidDispose(() => {
            secondaryPanel = undefined;
        });
    });

    context.subscriptions.push(disposable);
}

function updateSecondaryContent(editor: vscode.TextEditor) {
    if (!secondaryPanel) return;

    const document = editor.document;
    const text = document.getText();

    // Create HTML content with the code in a pre tag
    const content = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    margin: 0;
                    padding: 20px;
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    font-family: var(--vscode-editor-font-family);
                    font-size: var(--vscode-editor-font-size);
                }
                pre {
                    margin: 0;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }
                /* Add styles for zen mode look */
                html, body {
                    height: 100%;
                    overflow: hidden;
                }
                pre {
                    height: 100%;
                    overflow: auto;
                    padding: 20px;
                }
            </style>
        </head>
        <body>
            <pre>${escapeHtml(text)}</pre>
        </body>
        </html>
    `;

    secondaryPanel.webview.html = content;
    secondaryPanel.title = `${document.fileName.split(/[\\/]/).pop()} - Secondary View`;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function deactivate() {
    if (secondaryPanel) {
        secondaryPanel.dispose();
    }
}
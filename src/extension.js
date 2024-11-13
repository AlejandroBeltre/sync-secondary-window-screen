"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
let secondaryPanel;
function activate(context) {
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
        secondaryPanel = vscode.window.createWebviewPanel('secondaryEditor', 'Secondary View', vscode.ViewColumn.Two, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        updateSecondaryContent(currentEditor);
        // Update content when editor changes
        context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                updateSecondaryContent(editor);
            }
        }), vscode.workspace.onDidChangeTextDocument(event => {
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor && event.document === activeEditor.document) {
                updateSecondaryContent(activeEditor);
            }
        }));
        // Clean up when panel is closed
        secondaryPanel.onDidDispose(() => {
            secondaryPanel = undefined;
        });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function updateSecondaryContent(editor) {
    if (!secondaryPanel)
        return;
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
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
function deactivate() {
    if (secondaryPanel) {
        secondaryPanel.dispose();
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map
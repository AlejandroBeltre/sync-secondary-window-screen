import * as assert from 'assert';
import * as vscode from 'vscode';

describe('Extension Test Suite', () => {
    before(() => {
        // Before all tests
        vscode.window.showInformationMessage('Starting all tests.');
    });

    it('Sample test', () => {
        assert.strictEqual(-1, [1, 2, 3].indexOf(5));
        assert.strictEqual(-1, [1, 2, 3].indexOf(0));
    });
});
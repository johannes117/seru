import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Save, FolderOpen, Trash2, Terminal, Code } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ExecutionResult {
  output: string;
  error: string;
  timestamp: Date;
}

export default function PythonInterpreterPage() {
  const { t } = useTranslation();
  const [code, setCode] = useState('# Python Interpreter\nprint("Hello, World!")\n');
  const [output, setOutput] = useState<ExecutionResult[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [pythonInstalled, setPythonInstalled] = useState<boolean | null>(null);
  const [pythonVersion, setPythonVersion] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [code]);

  // Auto-scroll output to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Check Python installation on component mount
  useEffect(() => {
    const checkPython = async () => {
      try {
        const result = await window.python.checkInstall();
        setPythonInstalled(result.installed);
        if (result.version) {
          setPythonVersion(result.version);
        }
      } catch (error) {
        setPythonInstalled(false);
        console.error('Failed to check Python installation:', error);
      }
    };

    checkPython();
  }, []);

  const executeCode = async () => {
    if (!code.trim()) return;

    setIsExecuting(true);
    
    try {
      const result = await window.python.execute(code);
      
      setOutput(prev => [...prev, {
        output: result.output,
        error: result.error,
        timestamp: new Date()
      }]);
    } catch (error) {
      setOutput(prev => [...prev, {
        output: '',
        error: `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsExecuting(false);
    }
  };



  const clearOutput = () => {
    setOutput([]);
  };

  const saveCode = async () => {
    try {
      // In real implementation, use IPC to save file via main process
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'script.py';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  };

  const loadCode = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.py,.txt';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const content = await file.text();
          setCode(content);
        }
      };
      input.click();
    } catch (error) {
      console.error('Failed to load file:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter' && pythonInstalled) {
      executeCode();
    }
  };

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t('titlePythonInterpreterPage')}</h1>
        <p className="text-muted-foreground mt-2">
          Write and execute Python code with instant feedback.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${pythonInstalled === true ? 'bg-green-500' : pythonInstalled === false ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
          <span className="text-sm text-muted-foreground">
            {pythonInstalled === null ? 'Checking Python installation...' : 
             pythonInstalled ? `Python available (${pythonVersion})` : 
             'Python not found - please install Python'}
          </span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Editor Panel */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Python Editor
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadCode}
                  className="flex items-center gap-2"
                >
                  <FolderOpen className="h-4 w-4" />
                  Load
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveCode}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button
                  onClick={executeCode}
                  disabled={isExecuting || !pythonInstalled}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  {isExecuting ? 'Running...' : 'Run (Ctrl+Enter)'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full h-full min-h-[400px] p-4 font-mono text-sm bg-muted/50 border-0 outline-none resize-none"
              placeholder="Enter your Python code here..."
              spellCheck={false}
            />
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Output
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={clearOutput}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <div
              ref={outputRef}
              className="h-full min-h-[400px] p-4 bg-black text-green-400 font-mono text-sm overflow-y-auto"
            >
              {output.length === 0 ? (
                <div className="text-gray-500">No output yet. Run some code to see results here.</div>
              ) : (
                output.map((result, index) => (
                  <div key={index} className="mb-4">
                    <div className="text-gray-400 text-xs mb-1">
                      [{result.timestamp.toLocaleTimeString()}]
                    </div>
                    {result.output && (
                      <div className="text-green-400 whitespace-pre-wrap">
                        {result.output}
                      </div>
                    )}
                    {result.error && (
                      <div className="text-red-400 whitespace-pre-wrap">
                        {result.error}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">Quick Tips:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Press <kbd className="px-1 py-0.5 bg-background rounded text-xs">Ctrl+Enter</kbd> to execute code</li>
          <li>• Use the Load/Save buttons to work with Python files</li>
          <li>• Output and errors will appear in the terminal on the right</li>
          <li>• This interpreter supports most Python built-in functions</li>
        </ul>
      </div>
    </div>
  );
}
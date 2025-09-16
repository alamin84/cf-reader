import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

declare global {
    interface Window {
        hljs: any;
    }
}

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const codeRef = useRef<HTMLElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (codeRef.current && window.hljs) {
      window.hljs.highlightElement(codeRef.current);
    }
  }, [code, language, theme]);

  return (
    <pre className="bg-slate-100 dark:bg-black p-4 rounded-md overflow-x-auto border border-gray-200 dark:border-gray-700">
      <code ref={codeRef} className={`language-${language} text-sm`}>
        {code}
      </code>
    </pre>
  );
};

export default CodeBlock;
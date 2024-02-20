import React, { FC, useEffect, useRef, useState } from 'react';
import { Box, Button, Center, Spacer } from '@chakra-ui/react';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';

interface EditorParams {
  onExecute: (code: string) => void;
}

export const Editor: FC<EditorParams> = ({ onExecute }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [codeEditor, setCodeEditor] = useState<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current || codeEditor) {
      return;
    }
    const editor = new EditorView({
      doc: '// Your code here',
      extensions: [basicSetup, javascript()],
      parent: editorRef.current,
    });
    (window as any).editor = editor;
    setCodeEditor(editor);

    // cleanup
    return () => editor.destroy();
  }, []);

  const onRun = () => {
    if (!codeEditor) {
      return null;
    }

    const code = codeEditor.state.doc.toString();
  };

  return (
    <>
      <Box margin={'1.5em'} maxHeight="100%" ref={editorRef} /> <Spacer />
      <Box height="100%">
        <Center minWidth="48px">
          <Button colorScheme="green" onClick={onRun}>
            Run
          </Button>
        </Center>
      </Box>
    </>
  );
};

import React, { useRef, useEffect, useState } from 'react';
import { Flex, Square, Box } from '@chakra-ui/react';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';

export const Draff = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [codeEditor, setCodeEditor] = useState<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current || codeEditor) {
      return;
    }
    const editor = new EditorView({
      extensions: [basicSetup, javascript()],
      parent: editorRef.current,
    });
    setCodeEditor(editor);

    // cleanup
    return () => editor.destroy();
  }, []);

  return (
    <Flex height="100vh" bg="red">
      <Box minWidth="50%" bg="yellow.100" ref={editorRef}></Box>
      <Box>textedit 2</Box>
    </Flex>
  );
};

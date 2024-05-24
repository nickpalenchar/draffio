import React, { useState, useCallback } from 'react';

interface SaveCodeParams {
  code: string;
  username: string;
}
interface SaveCodeReturn {
  isLoading: boolean;
  error: string | null;
  saveCode: (
    params: SaveCodeParams,
  ) => Promise<{ username: string; draffName: string }>;
}

export const useSaveCode = (): SaveCodeReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveCode = useCallback<SaveCodeReturn['saveCode']>(
    async ({ code, username }) => {
      setIsLoading(true);
      setError(null);
      const fetchUrl = `${process.env.REACT_APP_API_GW}code/${username}`;
      return fetch(fetchUrl, {
        method: 'post',
        headers: {
          'content-type': 'application/json',
        },
        mode: process.env.NODE_ENV === 'development' ? 'no-cors' : 'cors',
        body: JSON.stringify({
          code,
        }),
      }).then(async (res) => {
        console.log('the result is ', res);
        const body = await res.json();
        console.log('BODY,', body); // {draffName: 'c25cc2f0dd705bb3cec07', username: 'tmp'}
        if (!body.draffName || !body.username) {
          console.error('Bad response from server');
          throw new Error(`Could not save (500)`);
        }
        return { draffName: body.draffName, username: body.username };
      });
    },
    [],
  );

  return { isLoading, error, saveCode };
};

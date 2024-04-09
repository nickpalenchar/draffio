import React, { useState, useCallback } from 'react';

interface SaveCodeParams {
  code: string;
  username: string;
}
type SaveCode = (params: SaveCodeParams) => Promise<void>;

export const useSaveCode = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>();
  console.log('env is ', process.env.NODE_ENV);
  const saveCode = useCallback<SaveCode>(async ({ code, username }) => {
    setIsLoading(true);
    setError(null);
    return fetch(`${process.env.REACT_APP_API_GW}code/${username}`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: process.env.NODE_ENV === 'development' ? 'no-cors' : 'cors',
      body: JSON.stringify({
        code
      }),
    }).then(async (res) => {
      console.log('the result is ', res);
      const body = await res.json();
      console.log('BODY,', body);
      setIsLoading(false);
    }).catch((error) => {
      setIsLoading(false);
      setError(`Could not save (${error?.statusCode ?? 500})`);
    })
  }, [])

  return { isLoading, error, saveCode }
}
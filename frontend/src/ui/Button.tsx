import React, { FC, MouseEventHandler, ReactElement } from 'react';
import { PropsWithChildren } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { Button as CButton } from '@chakra-ui/react';

type ButtonProps = Partial<{
  size: 'sm' | 'md' | 'lg' | 'xl';
  minW: string;
  colorScheme: string;
  isDisabled: boolean;
  rightIcon?: ReactElement;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}>;

export const Button: FC<PropsWithChildren & ButtonProps> = ({
  size = 'sm',
  minW = '7em',
  colorScheme = 'orange',
  isDisabled = false,
  rightIcon,
  onClick,
  children,
}) => {
  return (
    <CButton
      margin={2}
      size={size}
      minW={minW}
      borderRadius={0}
      colorScheme={colorScheme}
      isDisabled={isDisabled}
      rightIcon={rightIcon}
      onClick={onClick}
    >
      {children}
    </CButton>
  );
};

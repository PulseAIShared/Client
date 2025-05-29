import {
  Group,
  Box,
  Collapse,
  ThemeIcon,
  UnstyledButton,
  rem,
} from '@mantine/core';
import { useState } from 'react';
import { FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import classes from './css/links.module.css';

interface LinksGroupProps {
  icon: React.FC<any>;
  name: string;
  initiallyOpened?: boolean;
  link: string
  onClick: () => void;
}

export function LinksGroup({
  icon: Icon,
  name,
  initiallyOpened,
  link,
  onClick,
}: LinksGroupProps) {

  const [opened, setOpened] = useState(initiallyOpened || false);
  
  return (
    <>
      <Link
        to={link}
        className={classes.control}
      >
        <Group justify="space-between" gap={0}>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            <ThemeIcon variant="light" size={30}>
              <Icon style={{ width: rem(18), height: rem(18) }} />
            </ThemeIcon>
            <Box ml="md">{name}</Box>
          </Box>

        </Group>
      </Link>
    </>
  );
}

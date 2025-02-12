import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { useWindowScroll, useInterval } from 'react-use';
import {
  ContentBlock,
  Text,
  Link,
  Hidden,
  HiddenVisually,
} from 'braid-src/lib/components';
// TODO: COLORMODE RELEASE
// Use public import
import type { BoxProps } from 'braid-src/lib/components/Box/Box';
import { Box } from 'braid-src/lib/components/Box/Box';
import { RemoveScroll } from 'react-remove-scroll';
import { SubNavigation } from '../SubNavigation/SubNavigation';
import { useScrollLock } from '../useScrollLock/useScrollLock';
import { MenuButton } from '../MenuButton/MenuButton';
import { Logo } from '../Logo/Logo';
import { gutterSize, menuButtonSize, headerSpaceY } from './navigationSizes';
import * as styles from './Navigation.css';
import { ThemeToggle } from '../ThemeSetting';

const Header = ({
  menuOpen,
  menuClick,
}: {
  menuOpen: boolean;
  menuClick: () => void;
}) => (
  <Box paddingY={headerSpaceY} paddingX={gutterSize}>
    <Box display="flex" alignItems="center">
      <Hidden print>
        <Box
          paddingRight="medium"
          display={{
            mobile: 'flex',
            wide: 'none',
          }}
          alignItems="center"
        >
          <MenuButton open={menuOpen} onClick={menuClick} />
        </Box>
      </Hidden>
      <Box paddingRight="medium">
        <Text component="div" baseline={false}>
          <Link href="/" tabIndex={menuOpen ? -1 : undefined}>
            <Logo iconOnly height={menuButtonSize} />
            <HiddenVisually>Braid Logo</HiddenVisually>
          </Link>
        </Text>
      </Box>
      <ThemeToggle />
    </Box>
  </Box>
);

const FixedContentBlock = forwardRef<HTMLElement, BoxProps>(
  ({ children, ...props }, forwardedRef) => (
    <Box transition="fast" {...props} position="fixed" ref={forwardedRef}>
      <ContentBlock width="large">{children}</ContentBlock>
    </Box>
  ),
);

export const Navigation = () => {
  const lastScrollTop = useRef(0);
  const { y: scrollTop } = useWindowScroll();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);

  const location = useLocation();
  useEffect(() => setDirection(null), [location]);

  useInterval(() => {
    if (lastScrollTop.current !== scrollTop) {
      if (Math.abs(lastScrollTop.current - scrollTop) > 0) {
        setDirection(scrollTop > lastScrollTop.current ? 'down' : 'up');
      }
      lastScrollTop.current = scrollTop;
    }
  }, 250);

  useEffect(() => {
    setShowStickyHeader(scrollTop > 300 && direction === 'up');
  }, [direction, scrollTop]);

  useScrollLock(isMenuOpen);

  return (
    <ContentBlock width="large">
      <Box position="fixed" top={0}>
        <Header
          menuOpen={isMenuOpen}
          menuClick={() => setMenuOpen(!isMenuOpen)}
        />
      </Box>

      <RemoveScroll enabled={isMenuOpen} forwardProps>
        <FixedContentBlock
          overflow="auto"
          bottom={0}
          paddingX={gutterSize}
          paddingBottom="xxlarge"
          width="full"
          display={{
            mobile: isMenuOpen ? 'block' : 'none',
            wide: 'block',
          }}
          zIndex="sticky"
          className={[
            styles.subNavigationContainer,
            isMenuOpen ? styles.isOpen : undefined,
          ]}
        >
          <SubNavigation onSelect={() => setMenuOpen(false)} />
        </FixedContentBlock>
      </RemoveScroll>

      <Box
        background={{ lightMode: 'surface', darkMode: 'bodyDark' }}
        position="relative"
        overflow="hidden" // Fix stack space intercepting nav bar clicks
        paddingX={{
          mobile: gutterSize,
          wide: 'xxlarge',
        }}
        paddingY="small"
        paddingBottom="xxlarge"
        marginBottom="xxlarge"
        transition="fast"
        pointerEvents={isMenuOpen ? 'none' : undefined}
        className={[styles.pageContent, isMenuOpen ? styles.isOpen : undefined]}
      >
        <Box paddingBottom="xxlarge" marginBottom="xxlarge">
          <Outlet />
        </Box>
      </Box>

      <FixedContentBlock
        top={0}
        left={0}
        right={0}
        boxShadow={!isMenuOpen ? 'small' : undefined}
        display={['block', 'none']}
        pointerEvents={showStickyHeader ? undefined : 'none'}
        zIndex="sticky"
        background="body"
        opacity={showStickyHeader ? undefined : 0}
        tabIndex={-1}
        aria-hidden={true}
      >
        <Header
          menuOpen={isMenuOpen}
          menuClick={() => setMenuOpen(!isMenuOpen)}
        />
      </FixedContentBlock>
    </ContentBlock>
  );
};

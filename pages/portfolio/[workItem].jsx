import React, { useEffect, useMemo, useRef } from 'react';
import fs from 'fs';
import path from 'path';
import { useRouter } from 'next/router';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import ArrowBackIos from '@mui/icons-material/ArrowBackIos';
import useMediaQuery from '@mui/material/useMediaQuery';
import { motion } from 'framer-motion';

import { listTags } from '../../src/lib/tags';
import { composedWorkContent } from '../../src/lib/work';
import { PageHeading, SiteHead, WorkItem } from '../../src/components';
import { useHistory, useWindowDimensions } from '../../src/hooks';
import { pageTransition } from '../../src/lib/constants';

export default function Work({ tags, work }) {
  const router = useRouter();
  const { history } = useHistory();
  const useExitTransition = useRef(false);
  const containerRef = useRef(null);
  const workItem = useRef(router.query.workItem);
  const { width } = useWindowDimensions();
  const touchStart = useRef(null);
  const touchEnd = useRef(null);
  const noMargin = useMediaQuery((theme) => theme.breakpoints.down('md'));

  // the required distance between touchStart and touchEnd to be detected as a swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe || isRightSwipe) router.back();
  };

  const useInitialTransition = useMemo(() => {
    if (history?.length > 1) {
      if (history.slice(-2)[0] === '/portfolio') {
        return true;
      }
    }
    return false;
  }, [history]);

  useEffect(() => {
    const handleRouteChangeStart = (url) => {
      if (url === '/portfolio') {
        useExitTransition.current = true;
      }
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [history, router.events, router.pathname]);

  const selectedWorkItem = work.filter((item) => {
    if (item.scope.slug === workItem.current) return item;
    return null;
  })[0];

  return (
    <Container maxWidth="md" sx={{ height: '100%' }} ref={containerRef}>
      <Box py={5}>
        <SiteHead pageTitle={selectedWorkItem?.scope.title} />
        <Box position="sticky">
          <PageHeading />
        </Box>
        {!noMargin && (
          <Box position="fixed" top="2em" left="2em">
            <IconButton href="/portfolio">
              <ArrowBackIos />
            </IconButton>
          </Box>
        )}
        <motion.div
          initial={useInitialTransition && { x: width, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={useExitTransition.current && { x: width, opacity: 0 }}
          transition={pageTransition}
        >
          <Box
            display="flex"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {work && selectedWorkItem && (
              <WorkItem
                item={selectedWorkItem}
                tags={tags}
                containerSize={containerRef?.current?.clientHeight}
              />
            )}
          </Box>
        </motion.div>
      </Box>
    </Container>
  );
}

export const getStaticProps = async () => {
  const tags = listTags();
  const work = await composedWorkContent();
  return {
    props: {
      tags,
      work,
    },
  };
};

export const getStaticPaths = () => {
  const paths = fs
    .readdirSync(path.join(process.cwd(), 'content/work'))
    .map((filename) => ({
      params: {
        workItem: filename.split('.mdx')[0],
      },
    }));
  return {
    paths,
    fallback: false,
  };
};

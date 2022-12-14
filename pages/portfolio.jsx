import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import useMediaQuery from '@mui/material/useMediaQuery';
import { motion } from 'framer-motion';

import { listTags } from '../src/lib/tags';
import { composedWorkContent } from '../src/lib/work';
import { useHistory, useWindowDimensions } from '../src/hooks';
import {
  PageHeading,
  SiteHead,
  WorkSummary,
  WorkTags,
} from '../src/components';
import { pageTransition } from '../src/lib/constants';

export default function Portfolio({ tags, work }) {
  const [selectedTags, setselectedTags] = useState([]);
  const useExitTransition = useRef(false);
  const router = useRouter();
  const { history } = useHistory();
  const { width } = useWindowDimensions();
  const isNarrowPage = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const handleTagClick = (clickedTag) => {
    const selected = selectedTags.includes(clickedTag);
    if (selected) {
      setselectedTags(selectedTags.filter((tag) => tag !== clickedTag));
      return;
    }
    setselectedTags([clickedTag, ...selectedTags]);
  };

  const useInitialTransition = useMemo(() => {
    if (history?.length > 1) {
      const splitUrl = history.slice(-2)[0].split('/');
      if (splitUrl.length === 3 && splitUrl[1] === 'portfolio') {
        return true;
      }
    }
    return false;
  }, [history]);

  useEffect(() => {
    const handleRouteChangeStart = (url) => {
      const splitUrl = url.split('/');
      if (splitUrl.length === 3 && splitUrl[1] === 'portfolio') {
        useExitTransition.current = true;
      }
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [history, router.events, router.pathname]);

  return (
    <Container maxWidth="md" sx={{ height: '100%' }}>
      <Box py={5}>
        <SiteHead pageTitle="Portfolio" />
        <PageHeading />
        <motion.div
          initial={useInitialTransition && { x: -width, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={useExitTransition.current && { x: -width, opacity: 0 }}
          transition={pageTransition}
        >
          <Box display="flex">
            <Box width="100%">
              <Box display="flex" justifyContent="center" mb={1}>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  justifyContent="center"
                >
                  {tags.map((tag) => {
                    const selected = selectedTags.includes(tag.slug);
                    return (
                      <Chip
                        key={tag.slug}
                        label={tag.name}
                        onClick={() => handleTagClick(tag.slug)}
                        color="primary"
                        variant={selected ? 'filled' : 'outlined'}
                        sx={{
                          '&&': {
                            padding: 0.5,
                            mb: 1,
                          },
                        }}
                      />
                    );
                  })}
                </Stack>
              </Box>
              <Box>
                {work.map((item) => {
                  let tagEnabled = false;
                  item.scope.tags.forEach((tag) => {
                    if (selectedTags.includes(tag) || !selectedTags.length) {
                      tagEnabled = true;
                    }
                  });

                  if (!tagEnabled) return null;

                  return (
                    <React.Fragment key={item.scope.slug}>
                      <Grid container columns={21} pb={1}>
                        <Grid item xs={19} md={20}>
                          <WorkSummary item={item} />
                          <WorkTags
                            scope={item.scope}
                            tags={tags}
                            selectedTags={selectedTags}
                          />
                        </Grid>
                        <Grid item xs={2} md={1}>
                          <Box height="100%" display="flex" alignItems="center">
                            <IconButton href={`portfolio/${item.scope.slug}`}>
                              <ArrowForwardIosIcon
                                fontSize={isNarrowPage ? 'small' : 'medium'}
                              />
                            </IconButton>
                          </Box>
                        </Grid>
                      </Grid>
                      <Divider
                        variant="middle"
                        light
                        sx={{
                          my: 1,
                          mx: 15,
                        }}
                      />
                    </React.Fragment>
                  );
                })}
              </Box>
            </Box>
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

import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSetAtom } from 'jotai/react';
import React, { useEffect } from 'react';
import Orientation from 'react-native-orientation-locker';

import { graphql } from '@/gql';
import { useGraphQL } from '@/hooks/use-graphql';
import type { RootStackParamList } from '@/navigation/types';
import { ActivityIndicator, Text, View } from '@/ui';
import colors from '@/ui/theme/colors';

import MediaContainer from './components/media-container';
import { mediaTitleAtom } from './store';

type Props = NativeStackScreenProps<RootStackParamList, 'AnimeWatch'>;

const document = graphql(`
  query AnimeWatchScreenQuery($mediaId: Int!) {
    Media(id: $mediaId) {
      title {
        userPreferred
      }
      ...UseAnimeEpisode
    }
  }
`);

export const AnimeWatchScreen: React.FC<Props> = ({ route }) => {
  const navigation = useNavigation();
  const params = route.params;
  const setMediaTitle = useSetAtom(mediaTitleAtom);

  const { mediaId, episodeId } = params;

  const { data: media, isLoading: mediaIsLoading } = useGraphQL(document, {
    mediaId,
  });

  useEffect(() => {
    if (media?.Media?.title?.userPreferred) {
      setMediaTitle(media.Media.title.userPreferred);
    }
  }, [media?.Media?.title?.userPreferred, setMediaTitle]);

  useEffect(() => {
    Orientation.lockToLandscapeLeft();

    const parent = navigation.getParent();

    parent?.setOptions({
      tabBarStyle: {
        display: 'none',
      },
    });

    return () => {
      parent?.setOptions({
        tabBarStyle: undefined,
      });
    };
  }, [navigation]);

  if (mediaIsLoading) {
    return (
      <View className="flex h-full w-full flex-1 items-center justify-center">
        <ActivityIndicator color={colors.primary[500]} size={48} />
      </View>
    );
  }

  if (!media?.Media) {
    return <Text>Cannot load anime data...</Text>;
  }

  return (
    <MediaContainer currentEpisodeId={episodeId} mediaFragment={media.Media} />
  );
};

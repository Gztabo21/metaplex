import { useMemo } from 'react';
import { useMeta } from '../contexts';
import { Artist } from '../types';
import { AuctionView } from './useAuctions';

export const useCreators = (auction?: AuctionView) => {
  const { whitelistedCreatorsByCreator } = useMeta();

  const creators = useMemo(
    () =>
      [
        ...(
          [
            ...(auction?.items || []).flat().map(item => item?.metadata),
            auction?.participationItem?.metadata,
          ]
            .filter(item => item && item.info)
            .map(item => item?.info.data.creators || [])
            .flat() || []
        )
          .filter(creator => creator.verified)
          .reduce((agg, item) => {
            agg.add(item.address);
            return agg;
          }, new Set<string>())
          .values(),
      ].map((creator, index, arr) => {
        const knownCreator = whitelistedCreatorsByCreator[creator];
        let creatorOfDatabase: Artist | void;
        creatorOfDatabase = null;
        fetch('http://localhost:3001/solana/' + creator)
          .then(response => response.json())
          .then(data => {
            creatorOfDatabase = data;
            console.log('creatorOfDatabase', creatorOfDatabase);
          });
        return {
          address: creator,
          verified: true,
          // not exact share of royalties
          share: (1 / arr.length) * 100,
          image: knownCreator?.info.image || creatorOfDatabase.avatar || '',
          name: 'David',
          link: knownCreator?.info.twitter || '',
        } as Artist;
      }),
    [auction, whitelistedCreatorsByCreator],
  );
  return creators;
};

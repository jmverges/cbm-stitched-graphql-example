import gql from 'graphql-tag';

export const RECENT_ORDERS = gql`
  query RecentOrders {
    recentOrders {
      id
      total
      buyer {
        name
      }
    }
  }
`;

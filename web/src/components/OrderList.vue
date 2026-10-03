<script setup>
import { useQuery } from '@vue/apollo-composable';
import { RECENT_ORDERS } from '../graphql/recentOrders';

const { result } = useQuery(RECENT_ORDERS);
</script>

<template>
  <ul>
    <li v-for="order in result?.recentOrders ?? []" :key="order.id">
      {{ order.buyer.name }}: {{ order.total }}
    </li>
  </ul>
</template>

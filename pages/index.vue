<script setup lang="ts">
import type { ItemQuery } from '~/types'

interface Item {
  title: string
  source: string
}

const itemStore = useItems<Item>({
  collectionName: 'synchronizations',
  primaryKey: ['_id'],
})

const query = ref<ItemQuery<Item>>({
  select: ['title', 'version', 'source'],
  sort: [['title', 1], ['version', -1]],
})

const { data, pending, status, items } = itemStore.queryItems(query)

let queryChanged = false
const changeQuery = () => {
  if (queryChanged) {
    query.value.filter = {
      $or: [
        { title: { $eq: 'Poles' } },
        { title: { $eq: 'Divisions' } },
      ],
    }
  }
  else {
    query.value.filter = {
      $or: [
        { title: { $eq: 'Poles' } },
        { title: { $eq: 'Divisions' } },
        { title: { $eq: 'Managements' } },
      ],
    }
  }
  queryChanged = !queryChanged
}

let sortChanged = false
const changeSort = () => {
  if (sortChanged)
    query.value.sort = [['title', 1], ['version', -1]]

  else
    query.value.sort = [['title', -1], ['version', 1]]

  sortChanged = !sortChanged
}
</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardPanelContent>
        <div>
          <div class="flex gap-2">
            <UButton label="Change Query" @click="changeQuery" />
            <UButton label="Change Sort" @click="changeSort" />
          </div>
          <pre class="text-xs">
          {{ { items, pending, status, data } }}
        </pre>
        </div>
      </UDashboardPanelContent>
    </UDashboardPanel>
  </UDashboardPage>
</template>

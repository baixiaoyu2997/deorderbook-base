import { defineStore } from 'pinia'
import { getBullets } from 'deorderbook-sdk'
import type { Bullet } from 'deorderbook-sdk/subgraph-api'

export const useBulletsStore = defineStore('bullets', () => {
  const loading = ref(false)
  const bullets = ref<Bullet[]>([])
  let updatedAt = 0
  // TODO: set a common duration
  const updateDuration = 15 * 1000

  onWalletReady(
    () => {
      actionRefreshBullets()
    },
    {
      status: 'setup',
    }
  )

  async function actionRefreshBullets(force = false) {
    if (
      force ||
      (loading.value === false &&
        new Date().valueOf() - updatedAt >= updateDuration)
    ) {
      loading.value = true
      await getBullets()
        .then((resp) => {
          bullets.value = resp
        })
        .catch((error) => {
          console.error(error)
        })
        .finally(() => {
          updatedAt = new Date().valueOf()
          loading.value = false
        })
    }
  }

  return {
    loading,
    bullets,
    actionRefreshBullets,
  }
})

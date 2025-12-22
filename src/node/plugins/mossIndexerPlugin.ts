import { createDebug } from 'obug'
import type { Plugin } from 'vite'
import type { SiteConfig } from '../config'
import type { DefaultTheme } from '../defaultTheme'
import { sync } from 'vitepress-moss-search-indexer'

const debug = createDebug('vitepress:moss-indexer')

export async function mossIndexerPlugin(
  siteConfig: SiteConfig<DefaultTheme.Config>
): Promise<Plugin> {
  // Only enable when Moss search provider is configured
  if (siteConfig.site.themeConfig?.search?.provider !== 'moss') {
    return {
      name: 'vitepress:moss-indexer'
    }
  }

  return {
    name: 'vitepress:moss-indexer',
    apply: 'build',
    async buildEnd() {
      try {
        debug('🔍 Starting Moss index sync...')

        await sync({ root: siteConfig.srcDir })

        debug('✅ Moss index sync completed.')
      } catch (error) {
        const err = error as Error
        // Do not fail the docs build if indexing fails; just log it.
        siteConfig.logger.error(
          `Moss index sync failed: ${err.message}\n` +
            'The documentation build will continue without an updated Moss index.'
        )
        debug('Moss index sync error', err)
      }
    }
  }
}

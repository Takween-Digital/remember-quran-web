import type { OpenNextConfig } from '@opennextjs/cloudflare'

const config: OpenNextConfig = {
  buildDir: '.open-next',
  middleware: {
    external: ['@opentelemetry/api'],
  },
}

export default config

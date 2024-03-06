import {
  BundleServiceDefinition,
  type Empty,
  type LinkedBundle
} from '@devvit/protos'
import {createChannel, createClient} from 'nice-grpc-web'

export type BundleStore = {
  upload(bundle: Readonly<LinkedBundle>): Promise<Empty>
}

export function BundleStore(gatewayOrigin: string): BundleStore {
  const channel = createChannel(gatewayOrigin)
  return <BundleStore>(<unknown>createClient(BundleServiceDefinition, channel))
}

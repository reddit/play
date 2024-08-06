import type {LinkedBundle} from '@devvit/protos/types/devvit/runtime/bundle.js'
import {BundleServiceDefinition} from '@devvit/protos/types/devvit/service/bundle_service.js'
import {type Empty} from '@devvit/protos/types/google/protobuf/empty.js'
import {createChannel, createClient} from 'nice-grpc-web'

export type BundleStore = {
  upload(bundle: Readonly<LinkedBundle>): Promise<Empty>
}

export function BundleStore(gatewayOrigin: string): BundleStore {
  const channel = createChannel(gatewayOrigin)
  return <BundleStore>(<unknown>createClient(BundleServiceDefinition, channel))
}
